module.exports = {
    spotify: {
      output: {
        mode: 'tags-split',
        target: 'src/lib/spotify/api',
        schemas: 'src/lib/spotify/model',
        client: 'swr',
        mock: false,
        baseUrl: 'https://api.spotify.com/v1',
      },
      input: {
        target: './openapi.json',
      },
    },
  };