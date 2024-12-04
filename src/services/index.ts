import authRoutes from './auth/routes';
import userRoutes from './users/routes';

export default [
    ...authRoutes,
    ...userRoutes,
];
