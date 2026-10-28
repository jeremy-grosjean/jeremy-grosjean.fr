# Encodeur QR minimal (mode octet, niveau de correction M, versions 1 à 10), d'après la norme ISO/IEC 18004.
# Inspiré de l'implémentation de référence de Project Nayuki (MIT).
import sys

ECC_CODEWORDS_PER_BLOCK = {  # niveau M, index = version
    'M': [None, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26],
}
NUM_EC_BLOCKS = {
    'M': [None, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5],
}
FORMAT_BITS_ECL = {'L': 1, 'M': 0, 'Q': 3, 'H': 2}

def num_raw_data_modules(ver):
    result = (16 * ver + 128) * ver + 64
    if ver >= 2:
        numalign = ver // 7 + 2
        result -= (25 * numalign - 10) * numalign - 55
        if ver >= 7:
            result -= 36
    return result

def num_data_codewords(ver, ecl):
    return num_raw_data_modules(ver) // 8 - ECC_CODEWORDS_PER_BLOCK[ecl][ver] * NUM_EC_BLOCKS[ecl][ver]

def rs_multiply(x, y):
    z = 0
    for i in reversed(range(8)):
        z = (z << 1) ^ ((z >> 7) * 0x11D)
        z ^= ((y >> i) & 1) * x
    return z

def rs_divisor(degree):
    result = [0] * (degree - 1) + [1]
    root = 1
    for _ in range(degree):
        for j in range(degree):
            result[j] = rs_multiply(result[j], root)
            if j + 1 < degree:
                result[j] ^= result[j + 1]
        root = rs_multiply(root, 0x02)
    return result

def rs_remainder(data, divisor):
    result = [0] * len(divisor)
    for b in data:
        factor = b ^ result.pop(0)
        result.append(0)
        for i, coef in enumerate(divisor):
            result[i] ^= rs_multiply(coef, factor)
    return result

def alignment_positions(ver):
    if ver == 1:
        return []
    numalign = ver // 7 + 2
    step = 26 if ver == 32 else (ver * 4 + numalign * 2 + 1) // (numalign * 2 - 2) * 2
    result = [ver * 4 + 10 - i * step for i in range(numalign - 1)] + [6]
    return list(reversed(result))

def encode(text, ecl='M'):
    data = text.encode('utf-8')
    for ver in range(1, 11):
        cap_bits = num_data_codewords(ver, ecl) * 8
        cc = 8 if ver <= 9 else 16
        need = 4 + cc + len(data) * 8
        if need <= cap_bits:
            break
    else:
        raise ValueError('texte trop long')
    bits = []
    def append(val, n):
        for i in reversed(range(n)):
            bits.append((val >> i) & 1)
    append(0b0100, 4)
    append(len(data), cc)
    for b in data:
        append(b, 8)
    cap_bits = num_data_codewords(ver, ecl) * 8
    append(0, min(4, cap_bits - len(bits)))
    append(0, (-len(bits)) % 8)
    pad = 0xEC
    while len(bits) < cap_bits:
        append(pad, 8)
        pad ^= 0xEC ^ 0x11
    codewords = [int(''.join(map(str, bits[i:i + 8])), 2) for i in range(0, len(bits), 8)]

    # blocs + correction d'erreurs, puis entrelacement
    numblocks = NUM_EC_BLOCKS[ecl][ver]
    blockecclen = ECC_CODEWORDS_PER_BLOCK[ecl][ver]
    rawcodewords = num_raw_data_modules(ver) // 8
    numshortblocks = numblocks - rawcodewords % numblocks
    shortblocklen = rawcodewords // numblocks
    blocks = []
    div = rs_divisor(blockecclen)
    k = 0
    for i in range(numblocks):
        dat = codewords[k: k + shortblocklen - blockecclen + (0 if i < numshortblocks else 1)]
        k += len(dat)
        ecc = rs_remainder(dat, div)
        if i < numshortblocks:
            dat = dat + [0]
        blocks.append(dat + ecc)
    result = []
    for i in range(len(blocks[0])):
        for j, blk in enumerate(blocks):
            if i != shortblocklen - blockecclen or j >= numshortblocks:
                result.append(blk[i])
    allcw = result

    size = ver * 4 + 17
    mod = [[False] * size for _ in range(size)]
    fn = [[False] * size for _ in range(size)]
    def setf(x, y, v):
        mod[y][x] = v; fn[y][x] = True
    # motifs de synchronisation
    for i in range(size):
        setf(6, i, i % 2 == 0); setf(i, 6, i % 2 == 0)
    def finder(x, y):
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                xx, yy = x + dx, y + dy
                if 0 <= xx < size and 0 <= yy < size:
                    d = max(abs(dx), abs(dy))
                    setf(xx, yy, d not in (2, 4))
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4)
    ap = alignment_positions(ver)
    n = len(ap)
    for i in range(n):
        for j in range(n):
            if (i == 0 and j == 0) or (i == 0 and j == n - 1) or (i == n - 1 and j == 0):
                continue
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    setf(ap[i] + dx, ap[j] + dy, max(abs(dx), abs(dy)) != 1)
    def draw_format(mask):
        d = FORMAT_BITS_ECL[ecl] << 3 | mask
        rem = d
        for _ in range(10):
            rem = (rem << 1) ^ ((rem >> 9) * 0x537)
        b = (d << 10 | rem) ^ 0x5412
        get = lambda i: ((b >> i) & 1) != 0
        for i in range(0, 6): setf(8, i, get(i))
        setf(8, 7, get(6)); setf(8, 8, get(7)); setf(7, 8, get(8))
        for i in range(9, 15): setf(14 - i, 8, get(i))
        for i in range(0, 8): setf(size - 1 - i, 8, get(i))
        for i in range(8, 15): setf(8, size - 15 + i, get(i))
        setf(8, size - 8, True)
    draw_format(0)
    if ver >= 7:
        rem = ver
        for _ in range(12):
            rem = (rem << 1) ^ ((rem >> 11) * 0x1F25)
        b = ver << 12 | rem
        for i in range(18):
            bit = ((b >> i) & 1) != 0
            a, c = size - 11 + i % 3, i // 3
            setf(a, c, bit); setf(c, a, bit)
    # placement des données en zigzag
    i = 0
    right = size - 1
    while right >= 1:
        if right == 6:
            right = 5
        for vert in range(size):
            for j in range(2):
                x = right - j
                upward = ((right + 1) & 2) == 0
                y = size - 1 - vert if upward else vert
                if not fn[y][x] and i < len(allcw) * 8:
                    mod[y][x] = ((allcw[i >> 3] >> (7 - (i & 7))) & 1) != 0
                    i += 1
        right -= 2
    masks = [
        lambda x, y: (x + y) % 2 == 0, lambda x, y: y % 2 == 0, lambda x, y: x % 3 == 0,
        lambda x, y: (x + y) % 3 == 0, lambda x, y: (x // 3 + y // 2) % 2 == 0,
        lambda x, y: x * y % 2 + x * y % 3 == 0, lambda x, y: (x * y % 2 + x * y % 3) % 2 == 0,
        lambda x, y: ((x + y) % 2 + x * y % 3) % 2 == 0]
    def apply_mask(m):
        for y in range(size):
            for x in range(size):
                if not fn[y][x] and masks[m](x, y):
                    mod[y][x] = not mod[y][x]
    def penalty():
        p = 0
        def runs(line):
            s = 0; run = 1
            for k2 in range(1, len(line) + 1):
                if k2 < len(line) and line[k2] == line[k2 - 1]:
                    run += 1
                else:
                    if run >= 5: s += 3 + (run - 5)
                    run = 1
            return s
        for y in range(size): p += runs(mod[y])
        for x in range(size): p += runs([mod[y][x] for y in range(size)])
        for y in range(size - 1):
            for x in range(size - 1):
                c = mod[y][x]
                if c == mod[y][x + 1] == mod[y + 1][x] == mod[y + 1][x + 1]: p += 3
        pat1 = [True, False, True, True, True, False, True, False, False, False, False]
        pat2 = list(reversed(pat1))
        for y in range(size):
            for x in range(size - 10):
                row = mod[y][x:x + 11]
                if row == pat1 or row == pat2: p += 40
        for x in range(size):
            col = [mod[y][x] for y in range(size)]
            for y in range(size - 10):
                if col[y:y + 11] == pat1 or col[y:y + 11] == pat2: p += 40
        dark = sum(sum(r) for r in mod)
        total = size * size
        k3 = (abs(dark * 20 - total * 10) + total - 1) // total - 1
        p += k3 * 10
        return p
    best, bestp = 0, None
    for m in range(8):
        apply_mask(m); draw_format(m)
        pp = penalty()
        if bestp is None or pp < bestp:
            best, bestp = m, pp
        apply_mask(m)
    apply_mask(best); draw_format(best)
    return mod, ver, best

def to_svg(mod, border=4, dark='#0A0F24', light='#FFFFFF'):
    size = len(mod)
    dim = size + border * 2
    parts = []
    for y in range(size):
        for x in range(size):
            if mod[y][x]:
                parts.append(f'M{x + border},{y + border}h1v1h-1z')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {dim} {dim}" shape-rendering="crispEdges">'
            f'<rect width="100%" height="100%" fill="{light}"/><path d="{"".join(parts)}" fill="{dark}"/></svg>\n')

if __name__ == '__main__':
    text, out = sys.argv[1], sys.argv[2]
    m, v, mask = encode(text)
    open(out, 'w').write(to_svg(m))
    print('version', v, 'masque', mask, 'taille', len(m))
