import { useState } from 'react';

import work01 from '../assets/work-photos/work-01.jpeg';
import work02 from '../assets/work-photos/work-02.jpeg';
import work03 from '../assets/work-photos/work-03.jpeg';
import work04 from '../assets/work-photos/work-04.jpeg';
import work05 from '../assets/work-photos/work-05.jpeg';
import work06 from '../assets/work-photos/work-06.jpeg';
import work07 from '../assets/work-photos/work-07.jpeg';
import work08 from '../assets/work-photos/work-08.jpeg';
import work09 from '../assets/work-photos/work-09.jpeg';
import work10 from '../assets/work-photos/work-10.jpg';
import work11 from '../assets/work-photos/work-11.jpg';
import work12 from '../assets/work-photos/work-12.jpg';
import work13 from '../assets/work-photos/work-13.jpg';
import work14 from '../assets/work-photos/work-14.jpg';

const galleryItems = [
  { image: work01, title: 'Our Work 01' },
  { image: work02, title: 'Our Work 02' },
  { image: work03, title: 'Our Work 03' },
  { image: work04, title: 'Our Work 04' },
  { image: work05, title: 'Our Work 05' },
  { image: work06, title: 'Our Work 06' },
  { image: work07, title: 'Our Work 07' },
  { image: work08, title: 'Our Work 08' },
  { image: work09, title: 'Our Work 09' },
  { image: work10, title: 'Our Work 10' },
  { image: work11, title: 'Our Work 11' },
  { image: work12, title: 'Our Work 12' },
  { image: work13, title: 'Our Work 13' },
  { image: work14, title: 'Our Work 14' },
];


function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section className="gallery" id="gallery">
      <div className="gallery-header">
        <p className="section-label">OUR WORK</p>

        <h2>Helping homeowners get things done.</h2>

        <p>
          From installations to everyday repairs, we handle
          the small jobs that make a big difference.
        </p>
      </div>

      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <button
            className="gallery-card gallery-photo-button"
            key={item.title}
            type="button"
            onClick={() => setSelectedImage(item)}
            aria-label={`Enlarge ${item.title}`}
          >
            <div className="gallery-image">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
              />
            </div>
          </button>
        ))}
      </div>

      {selectedImage && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged project photo"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="gallery-lightbox-close"
            type="button"
            aria-label="Close enlarged photo"
            onClick={() => setSelectedImage(null)}
          >
            &times;
          </button>

          <img
            src={selectedImage.image}
            alt={selectedImage.title}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

export default Gallery;
