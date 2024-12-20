import math


# Saab lugeda kahe spets tif kaardi pealt.
klim_aravool = None  # Aasta klimaatiline äravoolunorm. Tuleb kartogrammilt
kesk_min_aravool = None  # Aasta keskmine minimaalne äravoolumoodul. Tuleb kartogrammilt

# Need saaks äkki delineate.py rida 367 juures ühekaupa ära salvestada
Akm = None  # intensiivselt kuivendatud madalsood
Ams = None  # madalsood ja soometsad
Ar = None  # rabad
B = None  # metsaga ja võsaga kaetud mineraalmaa
C = None  # lage mineraalmaa.

pindala = None  # Valgala pindala. Saab ka deliniate.py'st?

p = 10  # Ületõusutõenäosus. Ei tea veel kuidas saab, aga 10 sobib enamikel juhtudel.

# Need arvutab programm ise
q95 = kesk_min_aravool * 0.95  # 95% ülestõusutäonsusega keskmine aasta minimaalne äravoolumoodul
a = Ams + Akm
k95 = None  # Päevakeskmine äravoolu moodulkoefitsent.
qparand = None  # Parand, mis arvestab kohalike tingimuste mõju äravoolule.
aravoolunorm = None  # Äravoolunorm.
rs = None  # Parameeter, mis arvestab valgala metsasuse ja soostumise mõju sügisesele tippäravoolule.
rk = None  # Parameeter, mis arvestab valgala metsasuse ja soostumise mõju kevadisele tippäravoolule.
q_sugis = None  # Sügisene maksimaalne äravoolumoodul.
q_kevad = None  # Kevadine maksimaalne äravoolumoodul.

def qparandfunc(a, q95):
    return 0.02 * a + 0.3 * q95 - 1

def aravoolunormfunc(klim_aravool, qparand):
    return klim_aravool + qparand

def calc_rs(Ams, Ar, Akm, B, C):
    return 0.005 * (Ams + Ar - 0.2 * Akm - 0.1 * B - 0.6 * C) - 0.02

def calc_rk(Ams, Ar, Akm, B, C):
    return 0.004 * (Ams + 0.4 * (Ar + Akm) + B + 0.2 * C) - 0.2

def calc_k95(q95, aravoolunorm):
    return q95 / aravoolunorm

def calc_qs(aravoolunorm, p, pindala, k95, rs):
    return aravoolunorm * (
        (26 - 11.5 * math.log10(p + 1)) / (pindala + 1) ** 0.11
    ) ** (1 - k95 - rs)

def calc_qk(aravoolunorm, p, pindala, k95, rk):
    return aravoolunorm * (
        (112 - 52 * math.log10(p + 1)) / (pindala + 1) ** 0.14
    ) ** (1 - k95 - rk)

if pindala < 100:
    pindala = 100
    p = 10

qparand = qparandfunc(a, q95)
aravoolunorm = aravoolunormfunc(klim_aravool, qparand)
rs = calc_rs(Ams, Ar, Akm, B, C)
rk = calc_rk(Ams, Ar, Akm, B, C)
k95 = calc_k95(q95, aravoolunorm)
q_sugis = calc_qs(aravoolunorm, p, pindala, k95, rs)
q_kevad = calc_qk(aravoolunorm, p, pindala, k95, rk)
