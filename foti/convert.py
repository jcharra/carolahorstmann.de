from bs4 import BeautifulSoup

soup = BeautifulSoup(open("raw.html").read(), "html.parser")
    
with open("converted.html", "w") as out:
    img_tags = soup.find_all('img')
    for img in img_tags:
        width = img.get('width')
        height = img.get('height')  
        caption = img.get('alt')
        imgName = img.get('data-orig-file').split("/")[-1]
        width, height = img.get('data-orig-size').split(",")

        out.write(f"""
            <a href="/media/{imgName}" data-pswp-width="{width}" data-pswp-height="{height}" target="_blank">
                <img src="/media/{imgName}" alt='{caption}' />
            </a>
        """)
