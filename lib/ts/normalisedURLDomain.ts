/* Copyright (c) 2021, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { getURLDataFromString, isAnIpAddress } from "./utils";

export default class NormalisedURLDomain {
    private value: string;

    constructor(url: string) {
        this.value = normaliseURLDomainOrThrowError(url);
    }

    getAsStringDangerous = (): string => {
        return this.value;
    };
}

function normaliseURLDomainOrThrowError(input: string, ignoreProtocol = false): string {
    input = input.trim();
    try {
        if (!input.startsWith("http://") && !input.startsWith("https://")) {
            throw new Error("converting to proper URL");
        }

        // getURLDataFromString first tries to convert the string to a URL to ensure that it is a valid url string
        let urlInfo: { hostname: string; protocol: string; host: string } = getURLDataFromString(input);
        if (ignoreProtocol) {
            if (urlInfo.hostname.startsWith("localhost") || isAnIpAddress(urlInfo.hostname)) {
                input = "http://" + urlInfo.host;
            } else {
                input = "https://" + urlInfo.host;
            }
        } else {
            input = urlInfo.protocol + "//" + urlInfo.host;
        }
        return input;
        // eslint-disable-next-line no-empty
    } catch (err) {}

    if (input.startsWith("/")) {
        throw new Error("Please provide a valid domain name");
    }

    // not a valid URL
    if (input.indexOf(".") === 0) {
        input = input.substr(1);
    }
    // If the input contains a . it means they have given a domain name.
    // So we try assuming that they have given a domain name
    if (
        (input.indexOf(".") !== -1 || input.startsWith("localhost")) &&
        !input.startsWith("http://") &&
        !input.startsWith("https://")
    ) {
        input = "https://" + input;
        // at this point, it should be a valid URL. So we test that before doing a recursive call
        try {
            new URL(input);
            return normaliseURLDomainOrThrowError(input, true);

            // eslint-disable-next-line no-empty
        } catch (err) {}
    }
    throw new Error("Please provide a valid domain name");
}
