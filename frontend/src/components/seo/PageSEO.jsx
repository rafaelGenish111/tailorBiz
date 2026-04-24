import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://tailorbiz-software.com';
const DEFAULT_IMAGE = `${SITE_URL}/assets/images/og-banner.jpg`;

function PageSEO({ title, description, path, image = DEFAULT_IMAGE, type = 'website' }) {
  const location = useLocation();
  const pathname = path ?? (location.pathname === '/' ? '' : location.pathname);
  const url = `${SITE_URL}${pathname}`;
  const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />

      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:locale" content="he_IL" />

      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={absoluteImage} />
    </Helmet>
  );
}

export default PageSEO;
