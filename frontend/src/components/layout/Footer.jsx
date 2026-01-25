import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Shop',
      links: [
        { label: 'All Watches', path: '/shop' },
        { label: "Men's Collection", path: '/men' },
        { label: "Women's Collection", path: '/women' }
      ]
    },
    {
      title: 'Account',
      links: [
        { label: 'My Profile', path: '/profile' },
        { label: 'Wishlist', path: '/wishlist' },
        { label: 'Shopping Cart', path: '/cart' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' }
      ]
    }
  ];

  const socialLinks = [
    { icon: '𝕏', url: 'https://twitter.com', label: 'Twitter' },
    { icon: '📸', url: 'https://instagram.com', label: 'Instagram' },
    { icon: '▶️', url: 'https://youtube.com', label: 'YouTube' },
    { icon: 'in', url: 'https://linkedin.com', label: 'LinkedIn' }
  ];

  return (
    <footer className="py-16 px-6 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-xl font-medium tracking-widest uppercase mb-4 block">
              Crown<span className="text-amber-600">Hour</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Timeless Swiss engineering for discerning individuals who appreciate
              the art of precision timekeeping.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-amber-600 hover:text-amber-600 hover:bg-amber-600/5 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold tracking-widest uppercase mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-500 hover:text-amber-600 hover:pl-1 transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} CrownHour. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Crafted with precision and passion
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;