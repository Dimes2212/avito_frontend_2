import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import { useNavigate, useParams } from 'react-router-dom';

import { buildAdDetailsPath } from '../../app/config/routes';
import type { ItemByIdGetOut, ItemCategory } from '../../shared/types';

const API_BASE_URL = 'http://localhost:8080';

const categoryOptions: { value: ItemCategory; label: string }[] = [
  { value: 'electronics', label: 'Электроника' },
  { value: 'auto', label: 'Авто' },
  { value: 'real_estate', label: 'Недвижимость' },
];

type CharacteristicField = {
  key: string;
  label: string;
  type: 'input' | 'select';
  options?: { value: string; label: string }[];
};

type AiResult =
  | {
      type: 'success';
      message: string;
    }
  | {
      type: 'error';
      message: string;
    };

type AdEditDraft = {
  category?: ItemCategory;
  title?: string;
  price?: string;
  description?: string;
  params?: Record<string, string>;
  updatedAt?: number;
};

const characteristicFieldsByCategory: Record<ItemCategory, CharacteristicField[]> = {
  electronics: [
    {
      key: 'type',
      label: 'Тип',
      type: 'select',
      options: [
        { value: 'phone', label: 'Телефон' },
        { value: 'laptop', label: 'Ноутбук' },
        { value: 'misc', label: 'Другое' },
      ],
    },
    { key: 'brand', label: 'Бренд', type: 'input' },
    { key: 'model', label: 'Модель', type: 'input' },
    { key: 'color', label: 'Цвет', type: 'input' },
    {
      key: 'condition',
      label: 'Состояние',
      type: 'select',
      options: [
        { value: 'new', label: 'Новый' },
        { value: 'used', label: 'Б/у' },
      ],
    },
  ],
  auto: [
    { key: 'brand', label: 'Бренд', type: 'input' },
    { key: 'model', label: 'Модель', type: 'input' },
    { key: 'yearOfManufacture', label: 'Год выпуска', type: 'input' },
    {
      key: 'transmission',
      label: 'Коробка',
      type: 'select',
      options: [
        { value: 'automatic', label: 'Автомат' },
        { value: 'manual', label: 'Механика' },
      ],
    },
    { key: 'mileage', label: 'Пробег', type: 'input' },
    { key: 'enginePower', label: 'Мощность', type: 'input' },
  ],
  real_estate: [
    {
      key: 'type',
      label: 'Тип',
      type: 'select',
      options: [
        { value: 'flat', label: 'Квартира' },
        { value: 'house', label: 'Дом' },
        { value: 'room', label: 'Комната' },
      ],
    },
    { key: 'address', label: 'Адрес', type: 'input' },
    { key: 'area', label: 'Площадь', type: 'input' },
    { key: 'floor', label: 'Этаж', type: 'input' },
  ],
};

const numericCharacteristicKeys = new Set([
  'yearOfManufacture',
  'mileage',
  'enginePower',
  'area',
  'floor',
]);

async function fetchItemById(id: string): Promise<ItemByIdGetOut> {
  const response = await fetch(`${API_BASE_URL}/items/${id}`);

  if (!response.ok) {
    throw new Error('Не удалось загрузить объявление');
  }

  return response.json();
}

async function updateItemById(
  id: string,
  payload: {
    category: ItemCategory;
    title: string;
    description?: string;
    price: number;
    params: Record<string, unknown>;
  },
) {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Ошибка сохранения');
  }

  return response.json();
}

async function getAiDescriptionSuggestion(payload: {
  category: ItemCategory;
  title: string;
  price?: number;
  description?: string;
  params?: Record<string, unknown>;
}) {
  const response = await fetch(`${API_BASE_URL}/ai/description`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Не удалось сгенерировать описание');
  }

  return response.json() as Promise<{ success: boolean; description: string }>;
}

async function getAiPriceSuggestion(payload: {
  category: ItemCategory;
  title: string;
  price?: number;
  description?: string;
  params?: Record<string, unknown>;
}) {
  const response = await fetch(`${API_BASE_URL}/ai/price`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Не удалось получить рыночную цену');
  }

  return response.json() as Promise<{ success: boolean; price: number }>;
}

export function AdEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>('');
  const [titleInput, setTitleInput] = useState<string | undefined>(undefined);
  const [priceInput, setPriceInput] = useState<string | undefined>(undefined);
  const [descriptionInput, setDescriptionInput] = useState<string | undefined>(undefined);
  const [characteristicValues, setCharacteristicValues] = useState<Record<string, string>>({});
  const [titleTouched, setTitleTouched] = useState(false);
  const [priceTouched, setPriceTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingPrice, setIsGeneratingPrice] = useState(false);
  const [suggestedDescription, setSuggestedDescription] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [descriptionAiResult, setDescriptionAiResult] = useState<AiResult | null>(null);
  const [priceAiResult, setPriceAiResult] = useState<AiResult | null>(null);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ad-edit-by-id', id],
    queryFn: () => fetchItemById(id ?? ''),
    enabled: Boolean(id),
  });

  const categoryValue = selectedCategory || data?.category || '';
  const titleValue = titleInput ?? data?.title ?? '';
  const priceValue = priceInput ?? (data?.price != null ? String(data.price) : '');
  const descriptionValue = descriptionInput ?? data?.description ?? '';
  const currentCategory = categoryValue || undefined;
  const currentCategoryFields = currentCategory
    ? characteristicFieldsByCategory[currentCategory as ItemCategory]
    : [];

  const paramsRecord = (data?.params as Record<string, unknown> | undefined) ?? {};

  const getCharacteristicValue = (key: string): string => {
    if (key in characteristicValues) {
      return characteristicValues[key];
    }

    const value = paramsRecord[key];
    if (value == null) {
      return '';
    }

    return String(value);
  };

  const renderClearButton = (onClick: () => void, isDisabled: boolean) => (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="ml-[8px] h-[32px] w-[32px] text-[16px] text-[#A7A6AB] disabled:opacity-40"
    >
      ×
    </button>
  );

  const getOptionalFieldBorderSx = (isEmpty: boolean) => {
    if (!isEmpty) {
      return undefined;
    }

    return {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#FFA940',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#FFA940',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#FFA940',
      },
    };
  };

  const parsedPrice = Number(priceValue);
  const isPriceValid = priceValue.trim().length > 0 && Number.isFinite(parsedPrice) && parsedPrice >= 0;
  const isFormValid = Boolean(categoryValue) && titleValue.trim().length > 0 && isPriceValid;
  const showTitleError = titleTouched && titleValue.trim().length === 0;
  const showPriceError = priceTouched && priceValue.trim().length === 0;
  const descriptionGenerateLabel = descriptionValue.trim().length > 0 ? 'Улучшить описание' : 'Придумать описание';
  const draftStorageKey = id ? `ad-edit-draft-${id}` : '';

  const getCurrentParamsForRequest = () => {
    return currentCategoryFields.reduce<Record<string, unknown>>((acc, field) => {
      const fieldValue = getCharacteristicValue(field.key);

      if (fieldValue.trim().length === 0) {
        return acc;
      }

      if (numericCharacteristicKeys.has(field.key)) {
        const parsedValue = Number(fieldValue);

        if (Number.isFinite(parsedValue)) {
          acc[field.key] = parsedValue;
        }

        return acc;
      }

      acc[field.key] = fieldValue;
      return acc;
    }, {});
  };

  const handleGenerateDescription = async () => {
    if (!categoryValue || titleValue.trim().length === 0) {
      setTitleTouched(true);
      setNotification({
        open: true,
        message: 'Сначала заполните категорию и название',
        severity: 'error',
      });
      return;
    }

    try {
      setIsGeneratingDescription(true);
      setDescriptionAiResult(null);
      const response = await getAiDescriptionSuggestion({
        category: categoryValue as ItemCategory,
        title: titleValue.trim(),
        price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
        description: descriptionValue.trim() || undefined,
        params: getCurrentParamsForRequest(),
      });

      const generatedDescription = response.description ?? '';
      setSuggestedDescription(generatedDescription);
      setDescriptionAiResult({
        type: 'success',
        message: generatedDescription,
      });
    } catch {
      setDescriptionAiResult({
        type: 'error',
        message: 'Произошла ошибка при запросе к AI. Попробуйте повторить запрос или закройте уведомление.',
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGeneratePrice = async () => {
    if (!categoryValue || titleValue.trim().length === 0) {
      setTitleTouched(true);
      setNotification({
        open: true,
        message: 'Сначала заполните категорию и название',
        severity: 'error',
      });
      return;
    }

    try {
      setIsGeneratingPrice(true);
      setPriceAiResult(null);
      const response = await getAiPriceSuggestion({
        category: categoryValue as ItemCategory,
        title: titleValue.trim(),
        price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
        description: descriptionValue.trim() || undefined,
        params: getCurrentParamsForRequest(),
      });

      const nextSuggestedPrice = response.price ?? null;
      setSuggestedPrice(nextSuggestedPrice);
      setPriceAiResult({
        type: 'success',
        message:
          nextSuggestedPrice == null
            ? 'Не удалось определить цену.'
            : `Рекомендованная рыночная цена: ${nextSuggestedPrice} ₽`,
      });
    } catch {
      setPriceAiResult({
        type: 'error',
        message: 'Произошла ошибка при запросе к AI. Попробуйте повторить запрос или закройте уведомление.',
      });
    } finally {
      setIsGeneratingPrice(false);
    }
  };

  const handleApplySuggestedDescription = () => {
    if (!suggestedDescription) {
      return;
    }

    setDescriptionInput(suggestedDescription.slice(0, 1000));
    setDescriptionAiResult(null);
  };

  const handleApplySuggestedPrice = () => {
    if (suggestedPrice == null) {
      return;
    }

    setPriceInput(String(suggestedPrice));
    setPriceTouched(true);
    setPriceAiResult(null);
  };

  const handleCancel = () => {
    if (!id) {
      return;
    }

    navigate(buildAdDetailsPath(id));
  };

  const handleSave = async () => {
    if (!id || !isFormValid || !categoryValue) {
      setTitleTouched(true);
      setPriceTouched(true);
      return;
    }

    const paramsToSend = getCurrentParamsForRequest();

    const payload = {
      category: categoryValue as ItemCategory,
      title: titleValue.trim(),
      description: descriptionValue.trim() || undefined,
      price: parsedPrice,
      params: paramsToSend,
    };

    try {
      setIsSaving(true);
      await updateItemById(id, payload);
      if (draftStorageKey) {
        localStorage.removeItem(draftStorageKey);
      }

      setNotification({
        open: true,
        message: 'Изменения сохранены',
        severity: 'success',
      });

      setTimeout(() => {
        navigate(buildAdDetailsPath(id));
      }, 600);
    } catch {
      setNotification({
        open: true,
        message: 'Ошибка сохранения',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPriceButtonLabel = () => {
    if (isGeneratingPrice) {
      return 'Выполняется запрос';
    }

    return 'Узнать рыночную цену';
  };

  const getDescriptionButtonLabel = () => {
    if (isGeneratingDescription) {
      return 'Выполняется запрос';
    }

    return descriptionGenerateLabel;
  };

  useEffect(() => {
    if (!id || isDraftRestored) {
      return;
    }

    const rawDraft = localStorage.getItem(`ad-edit-draft-${id}`);
    if (!rawDraft) {
      setIsDraftRestored(true);
      return;
    }

    try {
      const parsedDraft = JSON.parse(rawDraft) as AdEditDraft;

      if (parsedDraft.category) {
        setSelectedCategory(parsedDraft.category);
      }
      if (typeof parsedDraft.title === 'string') {
        setTitleInput(parsedDraft.title);
      }
      if (typeof parsedDraft.price === 'string') {
        setPriceInput(parsedDraft.price);
      }
      if (typeof parsedDraft.description === 'string') {
        setDescriptionInput(parsedDraft.description);
      }
      if (parsedDraft.params && typeof parsedDraft.params === 'object') {
        setCharacteristicValues(parsedDraft.params);
      }
    } catch {
      localStorage.removeItem(`ad-edit-draft-${id}`);
    } finally {
      setIsDraftRestored(true);
    }
  }, [id, isDraftRestored]);

  useEffect(() => {
    if (!id || !isDraftRestored || !draftStorageKey) {
      return;
    }

    const draftPayload: AdEditDraft = {
      category: categoryValue || undefined,
      title: titleValue,
      price: priceValue,
      description: descriptionValue,
      params: characteristicValues,
      updatedAt: Date.now(),
    };

    localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
  }, [
    id,
    isDraftRestored,
    draftStorageKey,
    categoryValue,
    titleValue,
    priceValue,
    descriptionValue,
    characteristicValues,
  ]);

  return (
    <div className="min-h-screen w-full bg-[#F7F5F8] py-[32px]">
      <main className="mx-auto flex w-full max-w-[1103px] flex-col gap-[18px] rounded-[16px] bg-white px-[32px] pt-[32px] pb-[48px]">
        {isLoading ? <p className="text-[16px] text-[#848388]">Загрузка объявления...</p> : null}
        {isError ? <p className="text-[16px] text-red-500">Не удалось загрузить объявление</p> : null}

        <h1 className="h-[40px] w-[942px] text-[30px] leading-[40px] font-medium text-black/85">
          Редактирование объявления
        </h1>

        <section className="flex w-[942px] flex-col gap-[8px]">
          <p className="h-[22px] w-[942px] text-[16px] leading-[22px] font-semibold text-black/85">Категория</p>

          <Select
            value={categoryValue}
            size="small"
            displayEmpty
            onChange={(event) => setSelectedCategory(event.target.value as ItemCategory)}
            className="h-[32px] w-[256px] rounded-[8px] bg-white text-[14px]"
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </section>

        <div className="h-px w-[1039px] bg-[#F0F0F0]" />

        <section className="flex w-[957px] flex-col gap-[8px]">
          <div className="flex h-[22px] w-[957px] items-center gap-[8px]">
            <span className="h-[22px] w-[7px] text-right text-[14px] leading-[22px] font-normal text-[#FF4D4F]">
              *
            </span>
            <p className="h-[22px] w-[942px] text-[16px] leading-[22px] font-semibold text-black/85">Название</p>
          </div>

          <div className="flex w-[456px] items-center">
            <TextField
              required
              size="small"
              value={titleValue}
              onChange={(event) => setTitleInput(event.target.value)}
              onBlur={() => setTitleTouched(true)}
              error={showTitleError}
              className="flex-1"
            />
            {renderClearButton(() => setTitleInput(''), titleValue.length === 0)}
          </div>
          {showTitleError ? (
            <p className="m-[0px] ml-[15px] text-[14px] leading-[22px] text-[#FF4D4F]">Название должно быть заполнено</p>
          ) : null}
        </section>

        <div className="h-px w-[1039px] bg-[#F0F0F0]" />

        <section className="flex w-[957px] flex-col gap-[8px]">
          <div className="flex h-[22px] w-[957px] items-center gap-[8px]">
            <span className="h-[22px] w-[7px] text-right text-[14px] leading-[22px] font-normal text-[#FF4D4F]">
              *
            </span>
            <p className="h-[22px] w-[942px] text-[16px] leading-[22px] font-semibold text-black/85">Цена</p>
          </div>

          <div className="flex w-[957px] items-center">
            <div className="flex w-[456px] items-center">
              <TextField
                required
                size="small"
                type="number"
                inputProps={{ min: 0, step: 1 }}
                value={priceValue}
                onChange={(event) => setPriceInput(event.target.value)}
                onBlur={() => setPriceTouched(true)}
                error={showPriceError}
                className="flex-1"
              />
              {renderClearButton(() => setPriceInput(''), priceValue.length === 0)}
            </div>

            <div className="relative ml-[8px] flex flex-col items-start gap-[8px]">
              {priceAiResult ? (
                <div
                  className={`absolute right-[0px] bottom-full z-20 mb-[8px] w-[620px] rounded-[8px] border px-[12px] py-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${
                    priceAiResult.type === 'success'
                      ? 'border-[#F0F0F0] bg-white'
                      : 'border-[#FFCCC7] bg-[#FFF2F0]'
                  }`}
                >
                  {priceAiResult.type === 'success' ? (
                    <>
                      <p className="mb-[4px] text-[14px] leading-[20px] font-semibold text-black/85">Ответ AI:</p>
                      <p className="whitespace-pre-wrap text-[14px] leading-[22px] text-black/85">{priceAiResult.message}</p>
                      <div className="mt-[8px] flex items-center gap-[8px]">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleApplySuggestedPrice}
                          disabled={suggestedPrice == null}
                        >
                          Применить
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setPriceAiResult(null)}
                        >
                          Закрыть
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleGeneratePrice}
                          disabled={isGeneratingPrice}
                          className="normal-case"
                        >
                          Повторить запрос
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mb-[4px] text-[14px] leading-[20px] font-semibold text-[#CF1322]">
                        Произошла ошибка при запросе к AI
                      </p>
                      <p className="text-[14px] leading-[22px] text-black/85">{priceAiResult.message}</p>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => setPriceAiResult(null)}
                        className="mt-[8px]"
                      >
                        Закрыть
                      </Button>
                    </>
                  )}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleGeneratePrice}
                disabled={isGeneratingPrice}
                className="flex h-[32px] items-center gap-[10px] rounded-[8px] bg-[#F9F1E6] px-[7px] text-[14px] leading-[22px] text-[#FFA940] disabled:opacity-70"
              >
                <img src="/exclamation-circle.svg" alt="" className="h-[14px] w-[14px]" />
                <span className="whitespace-nowrap">{getPriceButtonLabel()}</span>
              </button>
            </div>
          </div>
          {showPriceError ? (
            <p className="m-[0px] ml-[15px] text-[14px] leading-[22px] text-[#FF4D4F]">Цена должна быть заполнена</p>
          ) : null}
        </section>

        <div className="h-px w-[1039px] bg-[#F0F0F0]" />

        <section className="flex w-[942px] flex-col gap-[8px]">
          <p className="h-[22px] w-[942px] text-[16px] leading-[22px] font-semibold text-black/85">
            Характеристики
          </p>

          <div className="flex w-[942px] flex-col gap-[10px]">
            {currentCategoryFields.map((field) => (
              <div key={field.key} className="flex w-[456px] flex-col">
                <div className="flex h-[30px] w-[456px] items-center gap-[8px] pb-[8px]">
                  <p className="h-[22px] w-[456px] text-[16px] leading-[22px] font-normal text-black/85">
                    {field.label}
                  </p>
                </div>

                {field.type === 'input' ? (
                  <div className="flex w-[456px] items-center">
                    {(() => {
                      const currentValue = getCharacteristicValue(field.key);
                      const isOptionalEmpty = currentValue.trim().length === 0;

                      return (
                        <>
                          <TextField
                            size="small"
                            value={currentValue}
                            onChange={(event) =>
                              setCharacteristicValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                            }
                            className="flex-1"
                            sx={getOptionalFieldBorderSx(isOptionalEmpty)}
                          />
                          {renderClearButton(
                            () => setCharacteristicValues((prev) => ({ ...prev, [field.key]: '' })),
                            currentValue.length === 0,
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex w-[456px] items-center">
                    {(() => {
                      const currentValue = getCharacteristicValue(field.key);
                      const isOptionalEmpty = currentValue.trim().length === 0;

                      return (
                        <Select
                          size="small"
                          displayEmpty
                          value={currentValue}
                          onChange={(event) =>
                            setCharacteristicValues((prev) => ({
                              ...prev,
                              [field.key]: String(event.target.value),
                            }))
                          }
                          className="h-[32px] w-[416px] rounded-[8px] bg-white text-[14px]"
                          sx={getOptionalFieldBorderSx(isOptionalEmpty)}
                        >
                          {(field.options ?? []).map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="h-px w-[1039px] bg-[#F0F0F0]" />

        <section className="flex w-[942px] flex-col gap-[8px]">
          <p className="h-[22px] w-[942px] text-[16px] leading-[22px] font-semibold text-black/85">Описание</p>

          <TextField
            multiline
            minRows={2}
            maxRows={10}
            value={descriptionValue}
            onChange={(event) => setDescriptionInput(event.target.value.slice(0, 1000))}
            className="w-[942px]"
            InputProps={{
              className: 'rounded-[8px]',
            }}
          />

          <div className="flex w-[942px] items-center justify-between">
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGeneratingDescription}
              className="flex h-[32px] items-center gap-[10px] rounded-[8px] bg-[#F9F1E6] px-[7px] text-[14px] leading-[22px] text-[#FFA940] disabled:opacity-70"
            >
              <img src="/exclamation-circle.svg" alt="" className="h-[14px] w-[14px]" />
              <span>{getDescriptionButtonLabel()}</span>
            </button>

            <span className="text-[14px] leading-[22px] text-[#A7A6AB]">{descriptionValue.length} / 1000</span>
          </div>
          {descriptionAiResult ? (
            <div className="flex w-[942px] flex-col gap-[8px]">
              <div
                className={`w-[620px] rounded-[8px] border px-[12px] py-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${
                  descriptionAiResult.type === 'success'
                    ? 'border-[#F0F0F0] bg-white'
                    : 'border-[#FFCCC7] bg-[#FFF2F0]'
                }`}
              >
                {descriptionAiResult.type === 'success' ? (
                  <>
                    <p className="mb-[4px] text-[14px] leading-[20px] font-semibold text-black/85">Ответ AI:</p>
                    <p className="whitespace-pre-wrap text-[14px] leading-[22px] text-black/85">
                      {descriptionAiResult.message}
                    </p>
                    <div className="mt-[8px] flex items-center gap-[8px]">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleApplySuggestedDescription}
                        disabled={!suggestedDescription}
                      >
                        Применить
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setDescriptionAiResult(null)}
                      >
                        Закрыть
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDescription}
                        className="normal-case"
                      >
                        Повторить запрос
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-[4px] text-[14px] leading-[20px] font-semibold text-[#CF1322]">
                      Произошла ошибка при запросе к AI
                    </p>
                    <p className="text-[14px] leading-[22px] text-black/85">{descriptionAiResult.message}</p>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => setDescriptionAiResult(null)}
                      className="mt-[8px]"
                    >
                      Закрыть
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </section>

        <div className="flex items-center gap-[8px]">
          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="normal-case"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={handleCancel}
            className="normal-case"
          >
            Отменить
          </Button>
        </div>

        <Snackbar
          open={notification.open}
          autoHideDuration={2500}
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </main>
    </div>
  );
}
