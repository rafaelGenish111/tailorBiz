import { Outlet, useParams, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import ProductHeader from './ProductHeader';
import { isValidProductId } from '../../utils/productsConfig';

function ProductLayout() {
  const { productId } = useParams();

  if (!productId || !isValidProductId(productId)) {
    return <Navigate to="/products" replace />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ProductHeader productId={productId} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default ProductLayout;
