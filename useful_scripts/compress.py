from pdf2image import convert_from_path
pages = convert_from_path('lease.pdf', 75)

for i, page in zip(list(range(len(pages))),pages):
    file_name = "out{}.jpg".format(str(i))
    page.save(file_name, 'JPEG')