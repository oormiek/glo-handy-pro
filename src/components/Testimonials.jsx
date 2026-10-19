
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import "./Testimonials.css";

const reviews = [
  {
    service: "Furniture Assembly",
    date: "September 25, 2026",
    text: "The furniture assembly was done really well! Very professional, neat, and efficient. He knew what he was doing and completed the work without wasting time or moving around unnecessarily. Everything was done properly, and I’m very happy with the result. Highly recommend!",
  },
  {
    service: "Heavy Lifting & Loading",
    date: "October 17, 2026",
    text: "Gajendran completed the task 100% fast and carefully. He is great at communication and reasonable with his price. I highly recommend him!",
  },
  {
    service: "Smart Home Installation",
    date: "October 10, 2026",
    text: "Gajendran was very professional with his work! Highly recommend!!",
  },
  {
    service: "Heavy Lifting & Loading",
    date: "September 29, 2026",
    text: "I had an excellent experience with this Tasker - Gajendran. His communication was great from start to finish, and he was very kind and accommodating. He worked safely and took a careful, non-rushed approach to the task. He even offered to clean up afterwards and handled the waste material. Fantastic service!",
  },
];



function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  // Add a copy of the last review at the beginning
  // and a copy of the first review at the end.
  const carouselReviews = [
    reviews[reviews.length - 1],
    ...reviews,
    reviews[0],
  ];

  const showPrevious = () => {
    setTransitionEnabled(true);
    setActiveIndex((current) => current - 1);
  };

  const showNext = () => {
    setTransitionEnabled(true);
    setActiveIndex((current) => current + 1);
  };

  const handleTransitionEnd = () => {
    if (activeIndex === 0) {
      setTransitionEnabled(false);
      setActiveIndex(reviews.length);

      setTimeout(() => {
        setTransitionEnabled(true);
      }, 30);
    } else if (activeIndex === reviews.length + 1) {
      setTransitionEnabled(false);
      setActiveIndex(1);

      setTimeout(() => {
        setTransitionEnabled(true);
      }, 30);
    }
  };

  const selectReview = (index) => {
    setTransitionEnabled(true);
    setActiveIndex(index + 1);
  };

  return (
    <section className="testimonials-section" id="reviews">
      <div className="testimonials-container">
        <div className="testimonials-heading">
          <span className="testimonials-eyebrow">
            CUSTOMER FEEDBACK
          </span>
          <h2>What Our Customers Say</h2>
          <p>Real experiences. Careful work. Happy customers.</p>

          <div className="testimonials-rating">
            <strong>5.0</strong>
            <span
              className="testimonials-stars"
              aria-label="5 out of 5 stars"
            >
              ★★★★★
            </span>
            <span>5 five-star reviews</span>
          </div>
        </div>

        <div className="testimonials-carousel">
          <button
            type="button"
            className="testimonial-arrow"
            onClick={showPrevious}
            aria-label="Previous review"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="testimonial-viewport">
            <div
              className="testimonial-track"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
                transition: transitionEnabled
                  ? "transform 0.45s ease-in-out"
                  : "none",
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {carouselReviews.map((review, index) => (
                <article
                  className="testimonial-card"
                  key={`${review.date}-${index}`}
                  aria-hidden={
                    index !== activeIndex
                  }
                >
                  <div
                    className="testimonial-card-stars"
                    aria-hidden="true"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={19}
                        fill="currentColor"
                      />
                    ))}
                  </div>

                  <h3>{review.service}</h3>

                  <p className="testimonial-text">
                    “{review.text}”
                  </p>

                  <div className="testimonial-card-footer">
                    <span>Customer feedback</span>
                    <span>{review.date}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="testimonial-arrow"
            onClick={showNext}
            aria-label="Next review"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div
          className="testimonial-dots"
          aria-label="Choose a review"
        >
          {reviews.map((review, index) => (
            <button
              key={`${review.date}-${index}`}
              type="button"
              className={`testimonial-dot ${
                index === activeIndex - 1 ? "active" : ""
              }`}
              onClick={() => selectReview(index)}
              aria-label={`Show review ${index + 1}`}
              aria-current={
                index === activeIndex - 1 ? "true" : undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
