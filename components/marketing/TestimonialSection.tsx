interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
}

interface TestimonialSectionProps {
  title: string;
  description: string;
  testimonials: Testimonial[];
}

export function TestimonialSection({ title, description, testimonials }: TestimonialSectionProps) {
  return (
    <section className="py-12 md:py-24 w-full">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{title}</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              {description}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col p-6 bg-muted/30 border rounded-lg">
              <div className="flex-1">
                <svg
                  className="h-8 w-8 text-primary/40 mb-4"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-lg mb-4">{testimonial.quote}</p>
              </div>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                  {testimonial.company && `, ${testimonial.company}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
