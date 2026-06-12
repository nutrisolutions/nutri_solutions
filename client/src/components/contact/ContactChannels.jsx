import { Briefcase, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { contactInfo, contactPageContent } from "../../data/content";

const channelIcons = {
  mail: Mail,
  phone: Phone,
  map: MapPin,
  clock: Clock,
  briefcase: Briefcase
};

const ContactChannels = () => {
  const channels = [
    {
      id: "email",
      icon: "mail",
      title: "Email",
      description: "Best for detailed briefs, attachments, and follow-ups.",
      action: (
        <a href={`mailto:${contactInfo.email}`} className="contact-channel-link">
          {contactInfo.email}
        </a>
      )
    },
    {
      id: "phone",
      icon: "phone",
      title: "Phone",
      description: "Call us for quick questions or to schedule a Free Demo.",
      action: (
        <a href={`tel:${contactInfo.phoneTel}`} className="contact-channel-link">
          {contactInfo.phone}
        </a>
      )
    },
    {
      id: "office",
      icon: "map",
      title: "Visit us",
      description: "Meet the team at our Orbit office on Knowledge City Road, Hyderabad.",
      action: (
        <a
          href={contactInfo.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-channel-link"
        >
          {contactInfo.address}
        </a>
      )
    },
    {
      id: "response",
      icon: "clock",
      title: "Response time",
      description: "We aim to reply within one business day for new inquiries.",
      action: <span className="contact-channel-meta">Mon–Fri · IST</span>
    },
    {
      id: "careers",
      icon: "briefcase",
      title: "Careers",
      description: "Looking to join the team? Browse open roles or reach out.",
      action: (
        <Link to={contactPageContent.careersBand.ctaTo} className="contact-channel-link">
          View open positions →
        </Link>
      )
    }
  ];

  return (
    <aside className="contact-aside" aria-label="Contact options">
      <div className="contact-channels">
        {channels.map((channel) => {
          const Icon = channelIcons[channel.icon];
          return (
            <article key={channel.id} className="contact-channel-card">
              <span className="contact-channel-icon" aria-hidden="true">
                <Icon size={20} />
              </span>
              <div className="contact-channel-body">
                <h3>{channel.title}</h3>
                <p>{channel.description}</p>
                <div className="contact-channel-action">{channel.action}</div>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
};

export default ContactChannels;
