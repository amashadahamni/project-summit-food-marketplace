const slides = [...document.querySelectorAll('.slide')];
let currentSlide = 0;
function renderSlide() {
  slides.forEach((slide, index) => slide.classList.toggle('active', index === currentSlide));
  document.querySelector('[data-current]').textContent = currentSlide + 1;
  document.querySelector('[data-total]').textContent = slides.length;
}
function moveSlide(change) { currentSlide = Math.max(0, Math.min(slides.length - 1, currentSlide + change)); renderSlide(); }
document.querySelector('[data-next]').addEventListener('click', () => moveSlide(1));
document.querySelector('[data-previous]').addEventListener('click', () => moveSlide(-1));
document.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === ' ') moveSlide(1); if (event.key === 'ArrowLeft') moveSlide(-1); });
renderSlide();