import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if using mock values
const isMockConfig = supabaseUrl?.includes('mock') || supabaseAnonKey?.includes('mock');

// Create a mock client if using mock values or not configured
let supabase: SupabaseClient<any, 'public', any> | any;

if (isMockConfig || !supabaseUrl || !supabaseAnonKey) {
  console.warn('Using mock Supabase client for development.');

  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => mockQueryBuilder,
    update: () => mockQueryBuilder,
    delete: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    neq: () => mockQueryBuilder,
    gt: () => mockQueryBuilder,
    gte: () => mockQueryBuilder,
    lt: () => mockQueryBuilder,
    lte: () => mockQueryBuilder,
    like: () => mockQueryBuilder,
    ilike: () => mockQueryBuilder,
    or: () => mockQueryBuilder,
    contains: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    limit: () => mockQueryBuilder,
    single: async () => ({ data: null, error: null }),
    then: (resolve: (value: { data: unknown; error: null }) => void) => 
      Promise.resolve({ data: [], error: null }).then(resolve),
  };

  const mockAuth = {
    signInWithPassword: async () => ({ data: { user: { id: 'mock-user', email: 'mock@test.com' } }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: { id: 'mock-user', email: 'mock@test.com' } }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };

  const mockStorage = {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      download: async () => ({ data: null, error: null }),
      remove: async () => ({ data: null, error: null }),
      list: async () => ({ data: [], error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  };

  supabase = {
    auth: mockAuth,
    storage: mockStorage,
    from: (table: string) => mockQueryBuilder,
    rpc: async () => ({ data: null, error: null }),
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {},
    }),
    removeChannel: () => {},
    realtime: {
      channels: [],
    },
    // Required SupabaseClient properties
    supabaseUrl: supabaseUrl || 'mock-url',
    supabaseKey: supabaseAnonKey || 'mock-key',
    realtimeUrl: '',
    authUrl: '',
    storageUrl: '',
    functionsUrl: '',
    headers: {},
    fetch: globalThis.fetch.bind(globalThis),
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };