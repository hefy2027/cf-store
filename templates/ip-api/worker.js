// Copyright: https://github.com/ccbikai/ip-api
// License: ISC

const EMOJI_FLAG_UNICODE_STARTING_POSITION = 127397

function getFlag(countryCode) {
  const regex = new RegExp('^[A-Z]{2}$').test(countryCode)
  if (!countryCode || !regex) return void 0
  try {
    return String.fromCodePoint(
      ...countryCode
        .split('')
        .map((char) => EMOJI_FLAG_UNICODE_STARTING_POSITION + char.charCodeAt(0))
    )
  } catch (error) {
    return void 0
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*'
}

export default {
  fetch(request) {
    const ip = request.headers.get('cf-connecting-ipv6') || request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip')
    const { pathname } = new URL(request.url)
    console.log(ip, pathname)
    if (pathname === '/geo') {
      const country = request.cf?.country || request.headers.get('cf-ipcountry')
      const colo = request.headers.get('cf-ray')?.split('-')[1]
      const geo = {
        flag: country && getFlag(country),
        country: country,
        countryRegion: request.cf?.region || request.headers.get('cf-region'),
        city: request.cf?.city || request.headers.get('cf-ipcity'),
        region: request.cf?.colo || colo,
        latitude: request.cf?.latitude || request.headers.get('cf-iplatitude'),
        longitude: request.cf?.longitude || request.headers.get('cf-iplongitude'),
        asOrganization: request.cf?.asOrganization || request.headers.get('x-asn'),
      }
      console.log(geo)
      return Response.json({
        ip,
        ...geo
      }, {
        headers: {
          ...CORS_HEADERS,
          'x-client-ip': ip
        }
      })
    }
    return new Response(ip, {
      headers: {
        ...CORS_HEADERS,
        'x-client-ip': ip
      }
    })
  }
}