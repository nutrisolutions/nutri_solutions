import {
  Briefcase,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Share2
} from "lucide-react";
import { Link } from "react-router-dom";
import { contactPageContent } from "../../data/content";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const channelIcons = {
  mail: Mail,
  phone: Phone,
  map: MapPin,
  clock: Clock,
  briefcase: Briefcase,
  share: Share2
};

const SOCIAL_ICONS = { instagram: Instagram, facebook: Facebook, linkedin: Linkedin };

const ContactChannels = () => {
  const contact = useSiteSettings();
  const officeCity = contact.addressLocality || "Hyderabad";
  const socialLinks = (contact.socialLinks || []).filter(
    (social) => social.url && SOCIAL_ICONS[social.icon]
  );

  const channels = [
    {
      id: "email",
      icon: "mail",
      title: "Email",
      description: "Best for detailed briefs, attachments, and follow-ups.",
      action: (
        <a href={`mailto:${contact.email}`} className="contact-channel-link">
          {contact.email}
        </a>
      )
    },
    {
      id: "phone",
      icon: "phone",
      title: "Phone",
      description: "Call us for quick questions or to schedule a Free Demo.",
      action: (
        <a href={`tel:${contact.phoneTel}`} className="contact-channel-link">
          {contact.phone}
        </a>
      )
    },
    {
      id: "office",
      icon: "map",
      title: "Visit us",
      description: `Meet the team at our office in ${officeCity}.`,
      action: contact.mapUrl ? (
        <a
          href={contact.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-channel-link"
        >
          {contact.address}
        </a>
      ) : (
        <span className="contact-channel-meta">{contact.address}</span>
      )
    },
    {
      id: "response",
      icon: "clock",
      title: "Response time",
      description: "We aim to reply within one business day for new inquiries.",
      action: <span className="contact-channel-meta">Mon–Fri · IST</span>
    },
    ...(socialLinks.length
      ? [
          {
            id: "social",
            icon: "share",
            title: "Follow us",
            description: "See our latest work, team updates, and openings.",
            action: (
              <ul className="contact-social-list">
                {socialLinks.map((social) => {
                  const Icon = SOCIAL_ICONS[social.icon];
                  return (
                    <li key={social.url}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-social-link"
                      >
                        <Icon size={16} aria-hidden="true" />
                        <span>{social.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )
          }
        ]
      : []),
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
