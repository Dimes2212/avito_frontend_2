import 'dotenv/config';
import Fastify from 'fastify';

import items from 'data/items.json' with { type: 'json' };
import { Item } from 'src/types.ts';
import { ItemsGetInQuerySchema, ItemUpdateInSchema } from 'src/validation.ts';
import { treeifyError, ZodError } from 'zod';
import { doesItemNeedRevision } from './src/utils.ts';

const ITEMS = items as Item[];

const fastify = Fastify({
  logger: true,
});

await fastify.register((await import('@fastify/middie')).default);

// Искуственная задержка ответов, чтобы можно было протестировать состояния загрузки
fastify.use((_, __, next) =>
  new Promise(res => setTimeout(res, 300 + Math.random() * 700)).then(next),
);

// Настройка CORS
fastify.use((_, reply, next) => {
  reply.setHeader('Access-Control-Allow-Origin', '*');
  reply.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  reply.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

fastify.options('/*', (_request, reply) => {
  reply.status(204).send();
});

async function askOllama(prompt: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434';
  const model = process.env.OLLAMA_MODEL ?? 'qwen2.5:3b';

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error('Ollama request failed');
  }

  const data = (await response.json()) as { response?: string };
  return (data.response ?? '').trim();
}

interface ItemGetRequest extends Fastify.RequestGenericInterface {
  Params: {
    id: string;
  };
}

fastify.get<ItemGetRequest>('/items/:id', (request, reply) => {
  const itemId = Number(request.params.id);

  if (!Number.isFinite(itemId)) {
    reply
      .status(400)
      .send({ success: false, error: 'Item ID path param should be a number' });
    return;
  }

  const item = ITEMS.find(item => item.id === itemId);

  if (!item) {
    reply
      .status(404)
      .send({ success: false, error: "Item with requested id doesn't exist" });
    return;
  }

  return {
    ...item,
    needsRevision: doesItemNeedRevision(item),
  };
});

interface ItemsGetRequest extends Fastify.RequestGenericInterface {
  Querystring: {
    q?: string;
    limit?: string;
    skip?: string;
    categories?: string;
    needsRevision?: string;
  };
}

fastify.get<ItemsGetRequest>('/items', request => {
  const {
    q,
    limit,
    skip,
    needsRevision,
    categories,
    sortColumn,
    sortDirection,
  } = ItemsGetInQuerySchema.parse(request.query);

  const filteredItems = ITEMS.filter(item => {
    return (
      item.title.toLowerCase().includes(q.toLowerCase()) &&
      (!needsRevision || doesItemNeedRevision(item)) &&
      (!categories?.length ||
        categories.some(category => item.category === category))
    );
  });

  return {
    items: filteredItems
      .toSorted((item1, item2) => {
        let comparisonValue = 0;

        if (!sortDirection) return comparisonValue;

        if (sortColumn === 'title') {
          comparisonValue = item1.title.localeCompare(item2.title);
        } else if (sortColumn === 'createdAt') {
          comparisonValue =
            new Date(item1.createdAt).valueOf() -
            new Date(item2.createdAt).valueOf();
        }

        return (sortDirection === 'desc' ? -1 : 1) * comparisonValue;
      })
      .slice(skip, skip + limit)
      .map(item => ({
        id: item.id,
        category: item.category,
        title: item.title,
        price: item.price,
        needsRevision: doesItemNeedRevision(item),
      })),
    total: filteredItems.length,
  };
});

interface ItemUpdateRequest extends Fastify.RequestGenericInterface {
  Params: {
    id: string;
  };
}

fastify.put<ItemUpdateRequest>('/items/:id', (request, reply) => {
  const itemId = Number(request.params.id);

  if (!Number.isFinite(itemId)) {
    reply
      .status(400)
      .send({ success: false, error: 'Item ID path param should be a number' });
    return;
  }

  const itemIndex = ITEMS.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    reply
      .status(404)
      .send({ success: false, error: "Item with requested id doesn't exist" });
    return;
  }

  try {
    const parsedData = ItemUpdateInSchema.parse({
      category: ITEMS[itemIndex].category,
      ...(request.body as {}),
    });

    ITEMS[itemIndex] = {
      id: ITEMS[itemIndex].id,
      createdAt: ITEMS[itemIndex].createdAt,
      updatedAt: new Date().toISOString(),
      ...parsedData,
    };

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      reply.status(400).send({ success: false, error: treeifyError(error) });
      return;
    }

    throw error;
  }
});

interface AiDescriptionRequest extends Fastify.RequestGenericInterface {
  Body: {
    category: string;
    title: string;
    price?: number;
    description?: string;
    params?: Record<string, unknown>;
  };
}

fastify.post<AiDescriptionRequest>('/ai/description', async (request, reply) => {
  const body = (request.body ?? {}) as AiDescriptionRequest['Body'];
  const title = String(body.title ?? '').trim();
  const category = String(body.category ?? '').trim();
  const price = Number(body.price);
  const params = body.params ?? {};
  const description = String(body.description ?? '').trim();

  if (!title || !category) {
    reply.status(400).send({ success: false, error: 'title and category are required' });
    return;
  }

  const prompt = [
    'Ты помогаешь писать тексты объявлений на русском языке.',
    'Сгенерируй короткое и понятное описание объявления (2-4 предложения).',
    'Без эмодзи, без markdown, без списков.',
    `Категория: ${category}`,
    `Название: ${title}`,
    `Цена: ${Number.isFinite(price) ? String(price) : 'не указана'}`,
    `Характеристики: ${JSON.stringify(params)}`,
    `Текущее описание: ${description || 'отсутствует'}`,
    'Верни только готовый текст описания.',
  ].join('\n');

  try {
    const generatedDescription = await askOllama(prompt);
    return { success: true, description: generatedDescription };
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ success: false, error: 'Не удалось получить ответ от Ollama' });
  }
});

interface AiPriceRequest extends Fastify.RequestGenericInterface {
  Body: {
    category: string;
    title: string;
    description?: string;
    params?: Record<string, unknown>;
    price?: number;
  };
}

fastify.post<AiPriceRequest>('/ai/price', async (request, reply) => {
  const body = (request.body ?? {}) as AiPriceRequest['Body'];
  const title = String(body.title ?? '').trim();
  const category = String(body.category ?? '').trim();
  const params = body.params ?? {};
  const description = String(body.description ?? '').trim();
  const currentPrice = Number(body.price);

  if (!title || !category) {
    reply.status(400).send({ success: false, error: 'title and category are required' });
    return;
  }

  const prompt = [
    'Ты оцениваешь рыночную цену объявлений в рублях.',
    'Верни только одно целое число без валюты и без пояснений.',
    `Категория: ${category}`,
    `Название: ${title}`,
    `Текущая цена: ${Number.isFinite(currentPrice) ? String(currentPrice) : 'не указана'}`,
    `Характеристики: ${JSON.stringify(params)}`,
    `Описание: ${description || 'отсутствует'}`,
  ].join('\n');

  try {
    const rawPrice = await askOllama(prompt);
    const digitsOnly = rawPrice.replace(/[^\d]/g, '');
    const suggestedPrice = Number(digitsOnly);

    if (!Number.isFinite(suggestedPrice) || suggestedPrice <= 0) {
      reply.status(422).send({ success: false, error: 'Некорректная цена от модели' });
      return;
    }

    return { success: true, price: suggestedPrice };
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ success: false, error: 'Не удалось получить ответ от Ollama' });
  }
});

// const port = Number(process.env.port) ?? 8080;
const parsedPort = Number(process.env.PORT);
const port = Number.isInteger(parsedPort) ? parsedPort : 8080;
const host = process.env.HOST ?? '0.0.0.0';

fastify.listen({ port, host }, function (err, _address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  fastify.log.debug(`Server is listening on ${host}:${port}`);
});
