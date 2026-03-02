#!/bin/bash
# Download company logos for all companies in COMPANIES_META
# Uses Clearbit Logo API first, then falls back to Google Favicon service
set -e

LOGOS_DIR="$(dirname "$0")/../public/logos"
mkdir -p "$LOGOS_DIR"

download_logo() {
  local slug="$1"
  local domain="$2"
  local output="$LOGOS_DIR/${slug}.png"

  # Skip if high-quality file already exists (>5KB — likely a real logo)
  if [ -f "$output" ] && [ "$(wc -c < "$output")" -gt 5000 ]; then
    echo "  skip  $slug (already exists)"
    return
  fi

  # Try Clearbit Logo API (returns transparent PNG, ~200x200)
  local tmp
  tmp=$(mktemp /tmp/logo_XXXXXX.png)
  local http_code
  http_code=$(curl -sL --max-time 8 \
    -w "%{http_code}" \
    -o "$tmp" \
    "https://logo.clearbit.com/$domain" 2>/dev/null || echo "000")

  local size
  size=$(wc -c < "$tmp" 2>/dev/null || echo 0)

  if [ "$http_code" = "200" ] && [ "$size" -gt 2000 ]; then
    mv "$tmp" "$output"
    echo "  ✓ clearbit  $slug ($size bytes)"
    return
  fi
  rm -f "$tmp"

  # Fallback: Google favicon at 256px
  curl -sL --max-time 8 \
    "https://www.google.com/s2/favicons?domain=$domain&sz=256" \
    -o "$output" 2>/dev/null
  local fb_size
  fb_size=$(wc -c < "$output" 2>/dev/null || echo 0)
  echo "  ~ favicon   $slug ($fb_size bytes)"
}

echo "=== Downloading logos for 100 companies ==="
echo ""

# IT & Tech
download_logo "positive"       "ptsecurity.com"
download_logo "yadro"          "yadro.com"
download_logo "kontur"         "kontur.ru"
download_logo "lanit"          "lanit.ru"
download_logo "croc"           "croc.ru"
download_logo "1c"             "1c.ru"
download_logo "groupib"        "group-ib.ru"
download_logo "bizone"         "bi.zone"
download_logo "cloudru"        "cloud.ru"
download_logo "acronis"        "acronis.com"
download_logo "jetbrains"      "jetbrains.com"
download_logo "miro"           "miro.com"
download_logo "wrike"          "wrike.com"
download_logo "infowatch"      "infowatch.ru"
download_logo "aviasales"      "aviasales.ru"
download_logo "dodo"           "dodo.pizza"

# Fintech & Banks
download_logo "alfabank"       "alfabank.ru"
download_logo "vtb"            "vtb.ru"
download_logo "tochka"         "tochka.com"
download_logo "sovcombank"     "sovcombank.ru"
download_logo "raiffeisen"     "raiffeisen.ru"
download_logo "gazprombank"    "gazprombank.ru"
download_logo "qiwi"           "qiwi.com"
download_logo "domrf"          "dom.rf"
download_logo "domclick"       "domclick.ru"
download_logo "alfastrah"      "alfastrah.ru"
download_logo "sbertech"       "sbertech.ru"
download_logo "diasoft"        "diasoft.ru"

# E-commerce
download_logo "megamarket"     "megamarket.ru"
download_logo "dns"            "dns-shop.ru"
download_logo "mvideo"         "mvideo.ru"

# Telecom
download_logo "rostelecom"     "rostelecom.ru"
download_logo "megafon"        "megafon.ru"
download_logo "beeline"        "beeline.ru"
download_logo "tele2"          "tele2.ru"

# HR Platforms
download_logo "superjob"       "superjob.ru"
download_logo "rabotaru"       "rabota.ru"
download_logo "profiru"        "profi.ru"

# EdTech
download_logo "skillbox"       "skillbox.ru"
download_logo "netology"       "netology.ru"
download_logo "geekbrains"     "gb.ru"

# Media & Entertainment
download_logo "dzen"           "dzen.ru"
download_logo "ivi"            "ivi.ru"
download_logo "kinopoisk"      "kinopoisk.ru"
download_logo "start"          "start.ru"
download_logo "rutube"         "rutube.ru"

# Real Estate
download_logo "cian"           "cian.ru"

# Logistics
download_logo "cdek"           "cdek.ru"
download_logo "boxberry"       "boxberry.ru"
download_logo "pochta"         "pochta.ru"

# HealthTech
download_logo "sberhealth"     "sberhealth.ru"
download_logo "docdoc"         "docdoc.ru"
download_logo "bestdoctor"     "bestdoctor.ru"

# Corporate & Industrial IT
download_logo "x5tech"         "x5-tech.ru"
download_logo "magnit"         "magnit.ru"
download_logo "sibur"          "sibur.ru"
download_logo "aeroflot"       "aeroflot.ru"
download_logo "gazpromneft"    "gazprom-neft.ru"
download_logo "bitrix24"       "bitrix24.ru"
download_logo "epam"           "epam.com"

# Gaming
download_logo "mygames"        "my.games"
download_logo "wargaming"      "wargaming.net"
download_logo "gaijin"         "gaijin.net"
download_logo "vkplay"         "vkplay.ru"

# Travel & Mobility
download_logo "tutu"           "tutu.ru"
download_logo "onetwotrip"     "onetwotrip.ru"
download_logo "whoosh"         "whoosh.bike"
download_logo "indriver"       "indriver.com"

# Additional
download_logo "kazanexpress"   "kazan.express"
download_logo "vkusvill"       "vkusvill.ru"
download_logo "ok"             "ok.ru"
download_logo "okko"           "okko.tv"
download_logo "yandexgo"       "go.yandex"
download_logo "kuper"          "kuper.ru"
download_logo "luxoft"         "luxoft.com"
download_logo "dataart"        "dataart.com"
download_logo "cft"            "cftonline.ru"
download_logo "samolet"        "samolet.ru"
download_logo "mtslink"        "mtslink.ru"
download_logo "practicum"      "practicum.yandex.ru"
download_logo "elma"           "elma365.com"
download_logo "softline"       "softline.ru"
download_logo "fixprice"       "fix-price.ru"
download_logo "nexign"         "nexign.com"
download_logo "yandexmarket"   "market.yandex.ru"

echo ""
echo "=== Done! ==="
echo "Logos saved to: $LOGOS_DIR"
ls -la "$LOGOS_DIR"/*.png 2>/dev/null | wc -l | xargs -I{} echo "{} PNG files downloaded"
