import * as awilix from 'awilix';
import { AwilixContainer, ContainerOptions } from 'awilix';
import { winstonLogger } from 'node-common';
import InRedisStorage from '../../infrastructure/storage/in-redis';
import ErrorHandler from '../../shared/error/handler';
import MaskConverter from '../../shared/mask/mask.converter';
import MaskInput from '../../shared/mask/mask.input';
import FlatListToIosStringsTransformer from '../../shared/transformers/flat-list-to-ios-strings.transformer';
import FlatListToXmlTransformer from '../../shared/transformers/flat-list-to-xml.transformer';
import JsonToFlatListTransformer from '../../shared/transformers/json-to-flat-list.transformer';
import JsonToIosStringsTransformer from '../../shared/transformers/json-to-ios-strings.transformer';
import JsonToXmlTransformer from '../../shared/transformers/json-to-xml.transformer';
import Transformers from '../../shared/transformers/transformers';
import CachedTranslations from '../../shared/translations/cached-translations';
import MaskedTranslations from '../../shared/translations/masked-translations';
import TranslationsKeyGenerator from '../../shared/translations/translations.key-generator';
import Server from './server/server';
import TranslationsController from './translations/translations.controller';
import TranslationsRouting from './translations/translations.routing';

export default function createContainer(options?: ContainerOptions): AwilixContainer {
  const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.CLASSIC,
    ...options,
  });

  const transformersRegistry = {
    flatListToIosStringsTransformer: awilix.asClass(FlatListToIosStringsTransformer, {
      lifetime: awilix.Lifetime.SINGLETON,
    }),
    flatListToXmlTransformer: awilix.asClass(FlatListToXmlTransformer, { lifetime: awilix.Lifetime.SINGLETON }),
    jsonToFlatListTransformer: awilix.asClass(JsonToFlatListTransformer, { lifetime: awilix.Lifetime.SINGLETON }),
    jsonToXmlTransformer: awilix.asClass(JsonToXmlTransformer, { lifetime: awilix.Lifetime.SINGLETON }).inject(() => ({
      jsonToFlatList: container.resolve<JsonToFlatListTransformer>('jsonToFlatListTransformer'),
      flatListToXml: container.resolve<FlatListToXmlTransformer>('flatListToXmlTransformer'),
    })),
    jsonToIosStringsTransformer: awilix
      .asClass(JsonToIosStringsTransformer, { lifetime: awilix.Lifetime.SINGLETON })
      .inject(() => ({
        jsonToFlatList: container.resolve<JsonToFlatListTransformer>('jsonToFlatListTransformer'),
        flatListToIosStrings: container.resolve<FlatListToIosStringsTransformer>('flatListToIosStringsTransformer'),
      })),
    transformers: awilix.asClass(Transformers, { lifetime: awilix.Lifetime.SINGLETON }).inject(() => ({
      transformers: [
        container.resolve<JsonToXmlTransformer>('jsonToXmlTransformer'),
        container.resolve<JsonToIosStringsTransformer>('jsonToIosStringsTransformer'),
      ],
    })),
  };

  container.register({
    errorHandler: awilix.asClass(ErrorHandler),
    logger: awilix.asValue(winstonLogger),
    maskConverter: awilix.asClass(MaskConverter),
    maskInput: awilix.asClass(MaskInput),
    maskedTranslations: awilix.asClass(MaskedTranslations),
    port: awilix.asValue(process.env.PORT || 3000),
    server: awilix.asClass(Server),
    storage: awilix.asClass(InRedisStorage),
    translationsController: awilix.asClass(TranslationsController),
    translationsKeyGenerator: awilix.asClass(TranslationsKeyGenerator),
    translationsRouting: awilix.asClass(TranslationsRouting),
    translationsStorage: awilix.asClass(CachedTranslations),
    ...transformersRegistry,
  });

  return container;
}
