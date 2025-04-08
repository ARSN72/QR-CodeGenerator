import qrcode

def create_qr_code(text, filename="qr_code.png"):
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    qr.add_data(text)
    qr.make(fit=True)
    
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    qr_image.save(filename)
    print(f"QR code has been saved as {filename}")

if __name__ == "__main__":
    text = input("Enter the text you want to convert to QR code: ")
    create_qr_code(text)
