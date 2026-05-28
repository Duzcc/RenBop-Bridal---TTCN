import urllib.request
import urllib.parse
import re

def fetch():
    query = "site:unsplash.com/photos bride"
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'}
    )
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            matches = re.findall(r'unsplash\.com/photos/[a-zA-Z0-9\-]+', html)
            unique_matches = list(set(matches))
            print("Found", len(unique_matches), "photo links:")
            for m in unique_matches[:40]:
                print(m)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    fetch()
