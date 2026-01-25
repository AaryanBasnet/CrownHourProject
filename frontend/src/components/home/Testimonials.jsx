import { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import SectionHeader from './SectionHeader';
import TestimonialCard from './Testimonialcard';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback data in case of error or empty database
  const fallbackTestimonials = [
    {
      initials: 'JM',
      name: 'James Mitchell',
      title: 'Watch Collector, London',
      text: 'The attention to detail is extraordinary. Every time I look at my Oxford Classic, I\'m reminded why Swiss craftsmanship is unmatched.'
    },
    {
      initials: 'SC',
      name: 'Sarah Chen',
      title: 'Executive, Singapore',
      text: 'Impeccable service from start to finish. The packaging alone tells you this brand understands luxury. My Praeludium is a conversation starter.'
    },
    {
      initials: 'MR',
      name: 'Michael Roberts',
      title: 'Architect, New York',
      text: 'I\'ve owned many luxury watches, but CrownHour offers something rare—heritage quality at an accessible price point. The Royal Navy is exceptional.'
    }
  ];

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await apiClient.get('/reviews/top-rated');
        if (data.success && data.data.length > 0) {
          const mappedTestimonials = data.data.map(review => ({
            initials: `${review.user.firstName.charAt(0)}${review.user.lastName.charAt(0)}`,
            name: `${review.user.firstName} ${review.user.lastName}`,
            title: 'Verified Collector', // Generic title since not persisted
            text: review.comment
          }));
          setTestimonials(mappedTestimonials);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="py-28 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Testimonials"
          title="What Collectors Say"
          description="Join thousands of satisfied collectors who have made CrownHour part of their legacy."
        />

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index} // Using index since name might not be unique
              initials={testimonial.initials}
              name={testimonial.name}
              title={testimonial.title}
              text={testimonial.text}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;