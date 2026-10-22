import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toFoodProduct, type FoodProduct } from '../domain/product';

/**
 * RTK Query: declares the endpoints once; generates hooks with loading/error/data state, caching and de-duplication.
 * Open Food Facts asks clients to identify themselves (browsers forbid setting User-Agent, so use X-User-Agent).
 */
export const foodApi = createApi({
  reducerPath: 'foodApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://world.openfoodfacts.org/api/v2/',
    prepareHeaders: (headers) => {
      headers.set('X-User-Agent', 'BodyTrack/1.0 (learning project)');
      return headers;
    },
    timeout: 10_000,
  }),
  keepUnusedDataFor: 60 * 60, // seconds: products rarely change
  endpoints: (build) => ({
    getProduct: build.query<FoodProduct | null, string>({
      query: (barcode) =>
        `product/${encodeURIComponent(barcode)}.json?fields=code,product_name,brands,nutriments,categories_tags,serving_quantity,nutriscore_grade`,
      transformResponse: (json: unknown) => toFoodProduct(json),
    }),
  }),
});

export const { useLazyGetProductQuery } = foodApi;
