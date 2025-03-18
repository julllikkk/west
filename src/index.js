import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}

// Отвечает, является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает, является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирный житель', power = 2, image) {
        super(name, power, image);
    }

    quacks = function () {
        console.log('quack');
    };
    swims = function () {
        console.log('float: both;');
    };
}

// Основа для собаки.
class Dog extends Creature {
    constructor(name = "Бандит", maxPower = 3, image) {
        super(name, maxPower, image);
    }
}

// Класс Lad (Браток)
class Lad extends Dog {
    static inGameCount = 0;

    constructor(name = "Браток", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        this.view.signalAbility(() => {
            continuation(value + bonus);
        });
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        this.view.signalAbility(() => {
            continuation(value - bonus);
        });
    }

    getDescriptions() {
        const descriptions = ['Чем их больше, тем они сильнее'];
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            descriptions.push(`Защита от урона: ${Lad.getBonus()}, Дополнительный урон: ${Lad.getBonus()}`);
        }
        return [...descriptions, ...super.getDescriptions()];
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Lad(),
    new Lad(),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});