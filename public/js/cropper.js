let cropper;

  const avatarInput = document.getElementById('avatarInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const imageToCrop = document.getElementById('imageToCrop');
  const cropModal = document.getElementById('cropModal');
  const cropBtn = document.getElementById('cropBtn');
  const cancelCropBtn = document.getElementById('cancelCropBtn');

  function bloquearScroll() {
    document.body.style.overflow = 'hidden';
  }
  function permitirScroll() {
    document.body.style.overflow = '';
  }

  // Abrir selector al click en la imagen
  avatarPreview.addEventListener('click', () => avatarInput.click());

  avatarInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      imageToCrop.src = event.target.result;
      cropModal.style.display = 'flex';
      bloquearScroll();
    };
    reader.readAsDataURL(file);
  });

  imageToCrop.addEventListener('load', function () {
    if (cropper) cropper.destroy();
    cropper = new Cropper(imageToCrop, {
      aspectRatio: 1,
      viewMode: 1,
      autoCropArea: 1,
      movable: true,
      zoomable: true,
      scalable: true,
      cropBoxResizable: true,
      background: false,
    });
  });

  window.addEventListener('DOMContentLoaded', () => {
  const savedImage = localStorage.getItem('avatarImage');
  if (savedImage) {
    avatarPreview.src = savedImage;
  }
});

cropBtn.addEventListener('click', function () {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas({
    width: 300,
    height: 300,
  });
  const croppedImage = canvas.toDataURL();

  avatarPreview.src = croppedImage;

  // Guarda la imagen recortada en localStorage
  localStorage.setItem('avatarImage', croppedImage);

  cropper.destroy();
  cropper = null;
  cropModal.style.display = 'none';
  permitirScroll();
});

  cancelCropBtn.addEventListener('click', function () {
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    cropModal.style.display = 'none';
    permitirScroll();
  });