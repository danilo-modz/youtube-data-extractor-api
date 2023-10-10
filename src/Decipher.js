import axios from 'axios'

export class Decipher {
    constructor(player_ias) {
        this.player_ias = player_ias;
    }

    async initialize() {
        this.code = await axios.get(`https://www.youtube.com/s/player/${this.player_ias}/player_ias.vflset/en_US/base.js`).then(response => response.data).catch(error => '')
        this.lines = this.code.split('\n')
        this.functionDeobfuscate = this.#extractFunctionDeobfuscate()
        this.functionDeobfuscateName = this.#extractFunctionDeobfuscateName()
        this.objectDeobfuscateName = this.#extractObjectName()
        this.objectDeobfuscate = this.#extractObjectDeobfuscate()
    }
    
    deobfuscate(signatureCipher) {
        const match = signatureCipher.match(/s=([^&]+).*?&url=(.*)/)

        if (!match) {
            return '';
        }

        const signature = decodeURIComponent(match[1])
        const url = decodeURIComponent(match[2])

        let compile = `${this.objectDeobfuscate} ${this.functionDeobfuscate} ${this.functionDeobfuscateName}('${signature}')`
        compile = compile.replace(`${this.functionDeobfuscateName}=function(a)`, `function ${this.functionDeobfuscateName}(a)`)

        const deobfuscated = eval(compile)

        return `${url}&sig=${deobfuscated}`
    }

    #extractFunctionDeobfuscate() {
        const deobfuscateLines = this.lines.filter(line => line.includes('{a=a.split("");'))

        return deobfuscateLines[0] ?? null;
    }

    #extractFunctionDeobfuscateName() {
        const matches = this.functionDeobfuscate.match(/\b(\w+)\s*=\s*function/)

        return matches[1] ?? '';
    }

    #extractObjectName() {
        const matches = this.functionDeobfuscate.match(/;\s*(\w+)\./)

        return matches[1] ?? '';
    }

    #extractObjectDeobfuscate() {
        let start = false;
        let object = '';

        this.lines.forEach(line => {
            let matches = line.match(new RegExp(`var ${this.objectDeobfuscateName}={([^}]+)},`)) ?? { }

            if (matches[0]) {
                line = matches[0]
                start = true
            }

            if (start) {
                if (line.includes('}};')) {
                    object += line.split('}};')[0] + '}};'
                    start = false
                } else {
                    object += line
                }
            }
        })

        return object
    }
}