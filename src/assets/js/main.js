

document.addEventListener('DOMContentLoaded', () => {
  // Get the modal
  var modal = document.getElementById("myModal");

  // Get the image and insert it inside the modal - use its "alt" text as a caption
  var img = document.getElementById("myImg");
  var modalImg = document.getElementById("img01");
  var captionText = document.getElementById("caption");

  if (modalImg !== null) {
    modalImg.onclick = function(e){
        console.log(e);
        e.stopPropagation();
    }
    // When the user clicks on <span> (x), close the modal
    modal.onclick = function() {
      modal.style.display = "none";
    }
  }

  const images = document.querySelectorAll('.image-thumb');
  
    const handleClick = (event) => {
      // Your logic here, for example, display a modal
      modal.style.display = "flex";
      modalImg.src = event.target.src;
      captionText.innerHTML = event.target.alt;
      console.log('Image clicked', event.target.src);
    };
  
    images.forEach(image => {
      image.addEventListener('click', handleClick);
    });



});

