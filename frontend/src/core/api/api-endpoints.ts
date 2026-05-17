import { apiConfig } from './api.config';

const buildUrl = (path: string) => `${apiConfig.baseUrl}${path}`;

export const apiPaths = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    confirmEmail: '/api/auth/confirm-email'
  },
  account: {
    profile: '/api/account/profile',
    addresses: '/api/account/addresses',
    addressById: (id: number) => `/api/account/addresses/${id}`
  },
  users: {
    list: '/api/users',
    detail: (id: number) => `/api/users/${id}`,
    updateRole: (id: number) => `/api/users/${id}/role`,
    delete: (id: number) => `/api/users/${id}`
  },
  products: {
    list: '/api/products',
    detail: (id: number) => `/api/products/${id}`,
    create: '/api/products',
    update: (id: number) => `/api/products/${id}`,
    delete: (id: number) => `/api/products/${id}`
  },
  categories: {
    list: '/api/categories',
    detail: (id: number) => `/api/categories/${id}`,
    create: '/api/categories',
    update: (id: number) => `/api/categories/${id}`,
    delete: (id: number) => `/api/categories/${id}`
  },
  feedbacks: {
    list: '/api/feedbacks',
    detail: (id: number) => `/api/feedbacks/${id}`,
    create: '/api/feedbacks',
    update: (id: number) => `/api/feedbacks/${id}`,
    delete: (id: number) => `/api/feedbacks/${id}`
  },
  cart: {
    detail: '/api/cart',
    addItem: '/api/cart/items',
    clear: '/api/cart/items',
    updateItem: (itemId: number) => `/api/cart/items/${itemId}`,
    removeItem: (itemId: number) => `/api/cart/items/${itemId}`
  },
  orders: {
    list: '/api/orders',
    detail: (id: number) => `/api/orders/${id}`,
    create: '/api/orders',
    cancel: (id: number) => `/api/orders/${id}/cancel`
  },
  payments: {
    list: '/api/payments',
    detail: (id: number) => `/api/payments/${id}`,
    byOrder: (orderId: number) => `/api/payments/order/${orderId}`,
    process: '/api/payments',
    vnpayUrl: '/api/payments/vnpay/url'
  },
  wallet: {
    get: '/api/wallet',
    transactions: '/api/wallet/transactions',
    deposit: '/api/wallet/deposit',
    depositVnpayUrl: '/api/wallet/deposit/vnpay/url',
    withdraw: '/api/wallet/withdraw',
    pay: '/api/wallet/pay'
  },
  legacy: {
    auth: {
      register: '/api/users/register',
      login: '/api/users/login',
      confirmEmail: '/api/users/confirm-email'
    },
    account: {
      me: '/api/users/me',
      myAddresses: '/api/users/me/addresses'
    },
    feedback: {
      list: '/api/Feedback',
      create: '/api/Feedback'
    }
  }
} as const;

export const apiEndpoints = {
  auth: {
    register: buildUrl(apiPaths.auth.register),
    login: buildUrl(apiPaths.auth.login),
    confirmEmail: buildUrl(apiPaths.auth.confirmEmail)
  },
  account: {
    profile: buildUrl(apiPaths.account.profile),
    addresses: buildUrl(apiPaths.account.addresses),
    addressById: (id: number) => buildUrl(apiPaths.account.addressById(id))
  },
  users: {
    list: buildUrl(apiPaths.users.list),
    detail: (id: number) => buildUrl(apiPaths.users.detail(id)),
    updateRole: (id: number) => buildUrl(apiPaths.users.updateRole(id)),
    delete: (id: number) => buildUrl(apiPaths.users.delete(id))
  },
  products: {
    list: buildUrl(apiPaths.products.list),
    detail: (id: number) => buildUrl(apiPaths.products.detail(id)),
    create: buildUrl(apiPaths.products.create),
    update: (id: number) => buildUrl(apiPaths.products.update(id)),
    delete: (id: number) => buildUrl(apiPaths.products.delete(id))
  },
  categories: {
    list: buildUrl(apiPaths.categories.list),
    detail: (id: number) => buildUrl(apiPaths.categories.detail(id)),
    create: buildUrl(apiPaths.categories.create),
    update: (id: number) => buildUrl(apiPaths.categories.update(id)),
    delete: (id: number) => buildUrl(apiPaths.categories.delete(id))
  },
  feedbacks: {
    list: buildUrl(apiPaths.feedbacks.list),
    detail: (id: number) => buildUrl(apiPaths.feedbacks.detail(id)),
    create: buildUrl(apiPaths.feedbacks.create),
    update: (id: number) => buildUrl(apiPaths.feedbacks.update(id)),
    delete: (id: number) => buildUrl(apiPaths.feedbacks.delete(id))
  },
  cart: {
    detail: buildUrl(apiPaths.cart.detail),
    addItem: buildUrl(apiPaths.cart.addItem),
    clear: buildUrl(apiPaths.cart.clear),
    updateItem: (itemId: number) => buildUrl(apiPaths.cart.updateItem(itemId)),
    removeItem: (itemId: number) => buildUrl(apiPaths.cart.removeItem(itemId))
  },
  orders: {
    list: buildUrl(apiPaths.orders.list),
    detail: (id: number) => buildUrl(apiPaths.orders.detail(id)),
    create: buildUrl(apiPaths.orders.create),
    cancel: (id: number) => buildUrl(apiPaths.orders.cancel(id))
  },
  payments: {
    list: buildUrl(apiPaths.payments.list),
    detail: (id: number) => buildUrl(apiPaths.payments.detail(id)),
    byOrder: (orderId: number) => buildUrl(apiPaths.payments.byOrder(orderId)),
    process: buildUrl(apiPaths.payments.process),
    vnpayUrl: buildUrl(apiPaths.payments.vnpayUrl)
  },
  wallet: {
    get: buildUrl(apiPaths.wallet.get),
    transactions: buildUrl(apiPaths.wallet.transactions),
    deposit: buildUrl(apiPaths.wallet.deposit),
    depositVnpayUrl: buildUrl(apiPaths.wallet.depositVnpayUrl),
    withdraw: buildUrl(apiPaths.wallet.withdraw),
    pay: buildUrl(apiPaths.wallet.pay)
  },
  legacy: {
    auth: {
      register: buildUrl(apiPaths.legacy.auth.register),
      login: buildUrl(apiPaths.legacy.auth.login),
      confirmEmail: buildUrl(apiPaths.legacy.auth.confirmEmail)
    },
    account: {
      me: buildUrl(apiPaths.legacy.account.me),
      myAddresses: buildUrl(apiPaths.legacy.account.myAddresses)
    },
    feedback: {
      list: buildUrl(apiPaths.legacy.feedback.list),
      create: buildUrl(apiPaths.legacy.feedback.create)
    }
  }
} as const;
