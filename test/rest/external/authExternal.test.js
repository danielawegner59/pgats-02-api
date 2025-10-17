const request = require('supertest');
const { expect, use } = require('chai');

const chaiExclude = require('chai-exclude');
use(chaiExclude);

require('dotenv').config();

describe('Autenticação JWT - External REST', () => {
  before(async () => {
    const postLogin = require('../fixture/requisicoes/login/postLogin.json');

    const respostaLogin = await request(process.env.BASE_URL_REST)
      .post('/users/login')
      .send(postLogin);

    token = respostaLogin.body.token;
  });

  it('POST /transfers sem token deve retornar 401', async () => {
    const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');

    const resposta = await request(process.env.BASE_URL_REST)
      .post('/transfers')
      .send(postTransfer);

    expect(resposta.status).to.equal(401);
    expect(resposta.body).to.have.property('message', 'Token não fornecido.');
  });

  it('POST /transfers com token inválido deve retornar 403', async () => {
    const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');

    const resposta = await request(process.env.BASE_URL_REST)
      .post('/transfers')
      .set('Authorization', 'Bearer token.invalido')
      .send(postTransfer);

    expect(resposta.status).to.equal(403);
    expect(resposta.body).to.have.property('message', 'Token inválido.');
  });

  it('GET /transfers com token válido deve retornar 200 e um array', async () => {
    const resposta = await request(process.env.BASE_URL_REST)
      .get('/transfers')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).to.equal(200);
    expect(resposta.body).to.be.an('array');
  });

  it('POST /transfers com token válido deve retornar 201 e a transferência criada', async () => {
    const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');

    const resposta = await request(process.env.BASE_URL_REST)
      .post('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .send(postTransfer);

    expect(resposta.status).to.equal(201);

    // Validação com fixture
    const respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosEuTenhoSucessoCom201Created.json');
    expect(resposta.body)
      .excluding('date')
      .to.deep.equal(respostaEsperada);
  });
});

