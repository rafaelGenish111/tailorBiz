import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';

const MotionBox = motion.create(Box);

const features = [
  {
    icon: ContentCutOutlinedIcon,
    title: 'תפירה אישית',
    description: 'לא מוצר מדף — אלא מערכת שנבנית מאפס סביב התהליכים, השפה והקצב של העסק שלכם.',
    gridArea: { md: '1 / 1 / 2 / 3' }, // spans 2 columns
  },
  {
    icon: HubOutlinedIcon,
    title: 'סדר ושליטה',
    description: 'מערכת אחת שמרכזת הכול — לקוחות, משימות, תקשורת ודוחות — במקום אחד.',
    gridArea: { md: '1 / 3 / 2 / 4' },
  },
  {
    icon: ShieldOutlinedIcon,
    title: 'שקט ניהולי',
    description: 'ביטחון תפעולי מלא. המערכת עובדת בשבילכם ברקע — בלי הפתעות.',
    gridArea: { md: '2 / 1 / 3 / 2' },
  },
  {
    icon: BoltOutlinedIcon,
    title: 'אוטומציה חכמה',
    description: 'תהליכים אוטומטיים שחוסכים שעות עבודה, מפחיתים טעויות אנוש ומשחררים אתכם לעשות מה שאתם הכי טובים בו.',
    gridArea: { md: '2 / 2 / 3 / 4' }, // spans 2 columns
  },
];

function BentoCard({ feature, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const Icon = feature.icon;

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      sx={{
        gridArea: feature.gridArea,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 4, md: 5 },
          bgcolor: '#383838',
          border: '1px solid #4a4a4a',
          borderRadius: '2px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'default',
          overflow: 'hidden',
          '&:hover': {
            borderColor: '#00FF99',
            '& .bento-icon': {
              color: '#0A0A0A',
              bgcolor: '#00FF99',
              borderColor: '#00FF99',
            },
            '& .bento-arrow': {
              opacity: 1,
              transform: 'translateX(0)',
            },
          },
        }}
      >
        {/* Icon */}
        <Box
          className="bento-icon"
          sx={{
            width: 52,
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            bgcolor: '#1A1A1A',
            border: '1px solid #333333',
            borderRadius: '2px',
            color: '#00FF99',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: '#FFFFFF',
              fontSize: { xs: '1.5rem', md: '1.75rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {feature.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#B0B0B0',
              lineHeight: 1.8,
              fontSize: { xs: '0.95rem', md: '1.05rem' },
            }}
          >
            {feature.description}
          </Typography>
        </Box>

        {/* Hover arrow indicator */}
        <Box
          className="bento-arrow"
          sx={{
            mt: 3,
            opacity: 0,
            transform: 'translateX(-10px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#00FF99',
            fontSize: '1.2rem',
          }}
        >
          ←
        </Box>
      </Box>
    </MotionBox>
  );
}

function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Box
      id="features"
      sx={{
        py: { xs: 16, md: 24 },
        bgcolor: '#0A0A0A',
        position: 'relative',
      }}
    >
      {/* Top architectural line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          bgcolor: '#333333',
        }}
      />

      <Container maxWidth="lg" sx={{ mx: 'auto', px: { xs: 3, md: 6 } }}>
        {/* Section Header */}
        <MotionBox
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          sx={{ mb: { xs: 8, md: 12 } }}
        >
          {/* Small label */}
          <Typography
            sx={{
              color: '#00FF99',
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              mb: 3,
            }}
          >
            מה אנחנו עושים
          </Typography>

          {/* Massive heading */}
          <Typography
            component="h2"
            sx={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: 700,
              fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
            }}
          >
            אנחנו מחברים את הנקודות למערכת אחת.
          </Typography>
        </MotionBox>

        {/* Bento Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gridTemplateRows: {
              md: 'auto auto',
            },
            gap: { xs: 2, md: 2 },
          }}
        >
          {features.map((feature, index) => (
            <BentoCard key={index} feature={feature} index={index} />
          ))}
        </Box>
      </Container>

      {/* Bottom architectural line */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          bgcolor: '#333333',
        }}
      />
    </Box>
  );
}

export default FeaturesSection;
