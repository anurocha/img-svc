const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3000;

const HTTP_METHOD = {
  POST : 'POST',
  GET : 'GET',
  PUT : 'PUT',
  DELETE : 'DELETE',
  OPTIONS : 'OPTIONS'
}

const RESPONSE_BODY = {
  OK : '{ "status" : "ok" }',
  INVALID : '{ "status" : "error invalid" }',
  NOTSUPPORT: '{ "status" : "not supported" }'
}

const server = http.createServer((req, res) => {
  if( !req.url.includes(productImgApi.path) ) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.end(RESPONSE_BODY.NOTSUPPORT);
    return;
  }

  switch (req.method) {
    case HTTP_METHOD.GET : {
      const data = productImgApi.Get(req);
      let responseBody;
      data !== undefined ? responseBody = JSON.stringify(data) : responseBody = RESPONSE_BODY.INVALID;
      fireResponse(res, 200, responseBody);
    };
    break;
    case HTTP_METHOD.POST :  {
      bodyData(req, (body) => {
        productImgApi.Post(req, JSON.parse(body));
        fireResponse(res, 200, RESPONSE_BODY.OK);
      })
    };
    break;
    case HTTP_METHOD.PUT :  {
      bodyData(req, (body) => {
        const ret = productImgApi.Put(req, JSON.parse(body));
        fireResponseFromBool(res, ret);
      });
    };
    break;
    case HTTP_METHOD.DELETE : {
      const ret = productImgApi.Delete(req);
      fireResponseFromBool(res, ret);
    };
    break;
    case HTTP_METHOD.OPTIONS : {
      fireResponseFromBool(res, true);
    };
    break;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


// to be moved to another file // ReqResHelper
const fireResponse = (res, httpCode, JsonBody) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
  res.statusCode = httpCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JsonBody);
}

const fireResponseFromBool = (res, bool) => {
  let responseBody;
  bool ? responseBody = RESPONSE_BODY.OK : responseBody = RESPONSE_BODY.INVALID;
  fireResponse(res, 200, responseBody)
}

const bodyData = (req, callback) => {
  let body = '';
  req.on('data', chunk => {
      body += chunk.toString();
  });
  req.on('end', () => {
    callback(body);
  });
} 
// ----

// to be moved to another file
class SimpleProductImageServiceApiHandler {
  path = '/product';
  #productModel = new Map();
  constructor(){
    this.#productModel.set(0, { id: 0, productInfo:{ name: 'macbook', type: 'labtop', color: 'white'}, image : 'https://mb.png'});
    this.#productModel.set(1, { id: 1, productInfo:{ name: 'iphone', type: 'phone', color: 'black'}, image : 'https://ip.png'});
    this.#productModel.set(2, { id: 2, productInfo:{ name: 'oneplus', type: 'phone', color: 'red'}, image : 'https://op.png'});
  }
  Get(req) {
    const incomingUrl = url.parse(req.url);
    const params = incomingUrl.pathname.split('/');
    return this.#productModel.get(parseInt(params[2]));
  }
  Post(req, body) {
    this.#productModel.set(body.id, body);
  }
  Put(req, body) {
    const data = this.#productModel.get(body.id);
    if( data !== undefined ) {
      this.#productModel.set(body.id, body);
      return true;
    } else {
      return false;
    }
  }
  Delete(req) {
    const data = this.Get(req);
    let returnValue = false;
    if( data !== undefined ) {
      this.#productModel.delete(data.id) ? returnValue = true : returnValue = false;
    }
    return returnValue;
  }

}
// ----

const productImgApi = new SimpleProductImageServiceApiHandler();