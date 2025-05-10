## My Image Board !

<style>
  .image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 15px;
    margin: 20px 0;
  }
  
  .image-item {
    width: 100%;
    overflow: hidden;
  }
  
  .image-item.wide {
    grid-column: span 3; /* Make wide images span all 3 columns */
  }
  
  .image-item.medium {
    grid-column: span 2; /* Make medium-width images span 2 columns */
  }
  
  .image-item img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease;
  }
  
  .image-item img:hover {
    transform: scale(1.02);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .image-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .image-item.wide {
      grid-column: span 2; /* On medium screens, wide images span 2 columns */
    }
    
    .image-item.medium {
      grid-column: span 2; /* On medium screens, medium images span 2 columns */
    }
  }
  
  @media (max-width: 480px) {
    .image-grid {
      grid-template-columns: 1fr;
    }
    
    .image-item.wide,
    .image-item.medium {
      grid-column: span 1; /* On small screens, all images take full width */
    }
  }
</style>

<div class="image-grid">
  <div class="image-item">
    <img src="/posts/1.jpg" alt="Image 1" title="Image 1">
  </div>
  <div class="image-item">
    <img src="/posts/2.jpg" alt="Image 2" title="Image 2">
  </div>
  <div class="image-item">
    <img src="/posts/4.jpg" alt="Image 4" title="Image 4">
  </div>
  <div class="image-item wide">
    <img src="/posts/3.png" alt="Image 3" title="Image 3">
  </div>
  <div class="image-item medium">
    <img src="/posts/Partha-Sarathi-scaled.jpg" alt="Image 5" title="Image 5">
  </div>

  <!-- Medium width image example:
  <div class="image-item medium">
    <img src="/posts/5.jpg" alt="Image 5" title="Image 5">
  </div>
  -->
</div>
