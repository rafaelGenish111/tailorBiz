/**
 * עיצוב אחיד לכרטיסי ליד/לקוח
 */

export const CARD_PADDING = 3;
export const SECTION_SPACING = 2;
export const FIELD_GRID = { xs: 12, md: 6 };

export const cardSection = {
  p: CARD_PADDING,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
};

export const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export const actionRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  mt: 2,
};

export const tabHeader = {
  variant: 'h6',
  gutterBottom: true,
  fontWeight: 600,
};
