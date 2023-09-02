export class Roll {
    errors = [];
    text;
    result;
    pretty;
    raw;
    parts;
    expressions;
    title;
    multi;
    constructor() {
        this.errors = [];
        this.text = "";
        this.result = "";
        this.pretty = [];
        this.raw = "";
        this.parts = [];
        this.expressions = [];
        this.title = "";
        this.multi = null;
    }
    static parseRoll(m) {
        const self = new Roll();
        // Iterations
        m = m.replace(/\[([0-9]+)\](.*?)(;.*)?$/, (_, i, p1, r) => {
            i = parseInt(i);
            i = i > 20 ? 20 : i;
            return Array(i).fill(p1.trim(), 0, i).map((s, ii) => s.replace('{i}', ii + 1)).join(';') + (r || '');
        });
        // Skill Checks
        m = m.replace(/c(-)?([0-9]+)([ad])?/g, (_, s1, p1, m1) => `1d10e${m1 || ''} ${s1 || '+'} ${p1}`);
        // Multi Rolls
        const rolls = m.split(/[;]/);
        if (rolls.length > 1) {
            const sep = m.match(/([,;])/)[0];
            const rs = rolls.map(r => Roll.parseRoll(r));
            const combined = rs.map(r => r.errors.length ? r.errors.join('; ') : r.text);
            const multiRoll = new Roll();
            multiRoll.multi = rs;
            multiRoll.raw = m;
            multiRoll.text = combined.join(sep == ';' ? '\n' : ', ');
            return multiRoll;
        }
        // Extracting title from roll string
        let title = m.replace(/^[^#]*#/, "").trim();
        m = m.replace(/([^#])#.*/, "$1").trim();
        // Isolating math
        m = m
            .replace(/([\+\-x\*\(\)])/g, (_, p1) => p1 == "x" ? " * " : ` ${p1} `)
            .replace(/\s\s+/g, ' ');
        let parts = m.trim().split(' ');
        const pretty = [];
        const expressions = [];
        let error = null;
        let d = null;
        parts.forEach(p => {
            if (d = p.match(/([1-9]\d*)?[dDfFwW]([1-9fF]\d*)?([aAdDkKlLter+])?([0-9=<>]*)?/)) {
                let count = d[1] ? parseInt(d[1]) : 1;
                const fate = p.match(/[fF]/);
                let die = d[2] ? parseInt(d[2]) : 20;
                const adv = d[3] && d[3].toLowerCase().indexOf('a') != -1;
                const dis = d[3] && d[3].toLowerCase().indexOf('d') != -1;
                const keep = d[3] && d[3].toLowerCase().indexOf('k') != -1 ? parseInt(d[4]) || 1 : false;
                const lose = d[3] && d[3].toLowerCase().indexOf('l') != -1 ? parseInt(d[4]) || 1 : false;
                let explode = d[3] && d[3].toLowerCase().indexOf('e') != -1 ? parseInt(d[4]) || die : false;
                // const mod = d[3] && d[3].toLowerCase().indexOf('+') != -1 ? parseInt(d[4]) || 1 : false;
                if (fate) {
                    die = 3;
                }
                if (!die) {
                    error = "Weird roll.";
                    return;
                }
                if (die > 1000 || count > 1000) {
                    error = "Upper Limmits.";
                    return;
                }
                let ex = [];
                for (let i = 0; i < count; i++) {
                    let r = 1 + Math.floor(Math.random() * die);
                    if (fate)
                        r -= 2;
                    if (explode && Roll.explodeCheck(r, explode))
                        r = `__**${r}**__`;
                    if (r == 20 && die == 20)
                        r = '__**20**__';
                    ex.push(r);
                }
                if (adv || dis) {
                    const ex2 = [];
                    for (let i = 0; i < count; i++) {
                        ex2.push(1 + Math.floor(Math.random() * die));
                    }
                    const exs = Roll.mathString(ex.join("+"));
                    const ex2s = Roll.mathString(ex2.join('+'));
                    const g = Math.max(exs, ex2s);
                    const l = Math.min(exs, ex2s);
                    const final = adv ? g : l;
                    const dir = adv ? '>' : '<';
                    let first = adv ? g : l;
                    if (first == 20 && die == 20)
                        first = '__**20**__';
                    const last = adv ? l : g;
                    pretty.push(`(${first} ${dir} ${last})`);
                    expressions.push(final);
                    return;
                }
                if (keep) {
                    if (keep > count) {
                        self.errors.push(`Keep values is more than die count (${keep} > ${count})`);
                        return;
                    }
                    ex = ex.sort(num => -1 * parseInt(('' + num).replace(/[_*]/g, '')));
                    const newEx = [];
                    const newPretty = [];
                    for (let k = 0; k < ex.length; k++) {
                        if (k < keep) {
                            newEx.push(ex[k]);
                            newPretty.push(ex[k]);
                        }
                        else {
                            newPretty.push(`~~${ex[k]}~~`);
                        }
                    }
                    pretty.push((newPretty.length > 1 ? '(' : '') + newPretty.join('+') + (newPretty.length > 1 ? ')' : ''));
                    expressions.push(newEx.join("+"));
                    return;
                }
                if (lose) {
                    if (lose > count) {
                        self.errors.push(`Keep lower value is more than die count (${lose} > ${count})`);
                        ex = ex.sort(num => parseInt(num));
                        const newEx = [];
                        const newPretty = [];
                        for (let k = 0; k < ex.length; k++) {
                            if (k < lose) {
                                newEx.push(ex[k]);
                                newPretty.push(ex[k]);
                            }
                            else {
                                newPretty.push(`~~${ex[k]}~~`);
                            }
                        }
                        pretty.push((newPretty.length > 1 ? '(' : '') + newPretty.join("+") + (newPretty.length > 1 ? ')' : ''));
                        expressions.push(newEx.join('+'));
                        return;
                    }
                }
                if (explode) {
                    if (die == 1) {
                        self.errors.push("exploding on a d1 creates a black hole, and your character dies.");
                        return;
                    }
                    console.log('- explode found:', { ex, die, explode });
                    let total = 0;
                    let explodes = ex.filter(c => Roll.explodeCheck(c, explode)).length;
                    while (explodes) {
                        total++;
                        if (total > 50) {
                            self.errors.push('Infinite explode loop. Either your character dies or the person they hit did');
                            break;
                        }
                        explodes--;
                        const r = 1 + Math.floor(Math.random() * die);
                        if (Roll.explodeCheck(r, explode)) {
                            explodes++;
                            ex.push(`__**${r}**__`);
                        }
                        else {
                            ex.push(r);
                        }
                    }
                }
                // if (mod) {
                //     ex.push(mod)
                // }
                const expression = (ex.length > 1 ? '(' : '') + ex.join('+') + (ex.length > 1 ? ')' : '');
                expressions.push(expression);
                pretty.push(expression);
            }
            else if (p.match(/[0-9?:><=+\-*/()]/)) {
                expressions.push(p);
                pretty.push(p);
            }
            else {
                self.errors.push('Unrecognized roll expression');
            }
        });
        self.raw = m;
        self.expressions = expressions;
        self.parts = parts;
        self.pretty = pretty;
        self.title = title;
        self.text = self.errors.length ? self.errors.join("; ") : self.parts.join(' ') + ' = ' + self.pretty.join(' ') + ' = **' + Roll.mathString(self.expressions.join(' ')) + "**" + (self.title ? ' **`' + self.title.trim() + '`**' : '');
        self.result = Roll.mathString(self.expressions.join(' '));
        return self;
    }
    static explodeCheck(c, explode) {
        if (!isNaN(explode)) {
            return parseInt(('' + c).replace(/[_*~^]/g, '')) >= parseInt(explode);
        }
        else {
            return Roll.mathString(('' + c).replace(/[_*~^]/g, '') + explode, true);
        }
    }
    static mathString(s, noErrors = false) {
        s = s.replace(/__\*\*([0-9]+)\*\*__/g, '$1');
        if (s.match(/[^0-9?:><=+\-*/() ]/)) {
            if (noErrors)
                return 0;
            return `Error: non-math \`${s}\``;
        }
        else {
            try {
                return eval(s);
            }
            catch (e) {
                if (noErrors)
                    return 0;
                return `Error: non-math \`${s}\``;
            }
        }
    }
}
/*

*/ 
