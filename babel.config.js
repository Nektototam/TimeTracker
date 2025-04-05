module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { 
      runtime: 'automatic',
      development: process.env.NODE_ENV === 'development',
      importSource: 'react'
    }],
  ],
  plugins: [
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
  ]
};