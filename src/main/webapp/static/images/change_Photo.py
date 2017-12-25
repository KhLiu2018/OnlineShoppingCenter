import Image, os
curDir = os.getcwd()
files = list()
for afile in os.listdir(curDir):
    aim = afile.split('.')[0]
    if aim[len(aim)-1] == "1" or aim[len(aim)-1] == "2" or aim[len(aim)-1] == "3":
        image_path = afile
        print(image_path)
        img = Image.open(image_path)
        new_img = img.resize((1140, 500), Image.ANTIALIAS)
        new_img.save(image_path, quality=100)
