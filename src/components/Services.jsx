
import {
  Wrench,
  Tv,
  Droplets,
  Hammer,
  Image,
  BrickWall,
  Ruler,
  DoorOpen,
  Package,
  ArrowUpRight,
} from "lucide-react";

const services = [
  {
    icon: Wrench,
    title: "Furniture Assembly",
    description:
      "IKEA and other furniture assembly and disassembly services.",
  },
  {
    icon: Tv,
    title: "TV & Wall Mounting",
    description:
      "TV mounting, shelves, mirrors and other wall-mounted items.",
  },
  {
    icon: Droplets,
    title: "Faucet Installation",
    description:
      "Faucet installation and minor plumbing-related repairs.",
  },
  {
    icon: Hammer,
    title: "Minor Repairs",
    description:
      "General home repairs, maintenance and handyman tasks.",
  },
  {
    icon: Image,
    title: "Hanging & Installing",
    description:
      "Hanging and installing household items around your home.",
  },
  {
    icon: BrickWall,
    title: "Drywall Patching",
    description: "Minor drywall patching and wall repair work.",
  },
  {
    icon: Ruler,
    title: "Light Carpentry",
    description:
      "Small carpentry projects and basic woodwork around your home.",
  },
  {
    icon: DoorOpen,
    title: "Door & Cabinet Adjustments",
    description:
      "Door, cabinet and hardware adjustments for a better fit and finish.",
  },
  {
    icon: Package,
    title: "Loading & Unloading",
    description:
      "Assistance with loading, unloading and moving household items.",
  },
];

function Services() {
  return (
    <section className="services" id="services">
      <div className="services-heading">
        <span className="services-eyebrow">WHAT WE DO</span>
        <h2>Our Services</h2>
        <span className="services-heading-line" />
        <p>
          Thoughtful solutions for the little jobs that make
          a house feel like home.
        </p>
      </div>

      <div className="service-grid">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <article className="service-card" key={service.title}>
              <div className="service-icon">
                <Icon size={25} strokeWidth={1.7} />
              </div>

              <h3>{service.title}</h3>
              <p>{service.description}</p>

              <span className="service-card-arrow" aria-hidden="true">
                <ArrowUpRight size={18} />
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Services;
