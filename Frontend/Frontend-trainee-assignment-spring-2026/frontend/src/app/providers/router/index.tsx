import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { APP_ROUTES } from '../../config/routes';
import { AdEditPage } from '../../../pages/ads-id-edit';
import { AdDetailsPage } from '../../../pages/ads-id';
import { AdsPage } from '../../../pages/ads';
import { NotFoundPage } from '../../../pages/not-found';

export function AppRouterProvider() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={APP_ROUTES.root} element={<Navigate to={APP_ROUTES.ads} replace />} />
        <Route path={APP_ROUTES.ads} element={<AdsPage />} />
        <Route path={APP_ROUTES.adDetails} element={<AdDetailsPage />} />
        <Route path={APP_ROUTES.adEdit} element={<AdEditPage />} />
        <Route path={APP_ROUTES.notFound} element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
