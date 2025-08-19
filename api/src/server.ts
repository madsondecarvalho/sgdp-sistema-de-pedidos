import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { clientRoutes } from './routes/cliente.route';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyMySQL from '@fastify/mysql';

const app = Fastify({
  logger: true
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Registrar o plugin Swagger para gerar a especificação OpenAPI
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API de Clientes',
      description: 'API para gerenciamento de clientes',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3333',
      },
    ],
    tags: [
      { name: 'clientes', description: 'Operações relacionadas a clientes' },
    ],
    components: {
      schemas: {
        CreateClienteRequest: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { 
              type: 'string', 
              description: 'Nome do cliente',
              minLength: 3 
            },
            email: { 
              type: 'string', 
              format: 'email', 
              description: 'Email do cliente' 
            }
          }
        },
        Cliente: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID único do cliente' },
            name: { type: 'string', description: 'Nome do cliente' },
            email: { type: 'string', format: 'email', description: 'Email do cliente' },
            createdAt: { type: 'string', format: 'date-time', description: 'Data de criação' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Data da última atualização' }
          }
        },
        // Novos schemas para as respostas
        ClienteResponse: {
          type: 'object',
          properties: {
            client: {
              $ref: '#/components/schemas/Cliente'
            }
          }
        },
        ClientesResponse: {
          type: 'object',
          properties: {
            clients: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Cliente'
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro'
            }
          }
        }
      }
    }
  },
  transform: ({ schema, url }) => {
    // Transforma esquemas Zod em esquemas OpenAPI
    return { schema, url };
  }
});

// Registrar a UI do Swagger
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'GET',
  url: '/',
  schema: {
    querystring: z.object({
      name: z.string().min(4),
    }),
    response: {
      200: z.string(),
    },
  },
  handler: (req, res) => {
    res.send(req.query.name);
  },
});

// Registrando as rotas de clientes
app.register(clientRoutes);

//database
app.register(fastifyMySQL, {
  connectionString: 'mysql://znap_user:znap_password@localhost/pedidos_service',
  promise: true
});

(async () => {
  try {
    await app.listen({ port: 3333 });
    console.log('Servidor rodando em http://localhost:3333');
    console.log('Documentação disponível em http://localhost:3333/docs');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();