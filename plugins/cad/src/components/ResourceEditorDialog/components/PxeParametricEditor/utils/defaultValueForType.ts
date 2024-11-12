/**
 * Copyright 2024 The Nephio Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PxeValueType } from '../types/PxeConfiguration.types';
import { PxeValue } from '../types/PxeParametricEditor.types';

export const defaultValueForType = (valueType: PxeValueType): PxeValue => {
  switch (valueType) {
    case PxeValueType.String:
      return '';
    case PxeValueType.Number:
      return 0;
    case PxeValueType.Object:
      return {};
    case PxeValueType.Array:
      return [];
    default:
      throw new Error(`Unsupported value type ${valueType}`);
  }
};
