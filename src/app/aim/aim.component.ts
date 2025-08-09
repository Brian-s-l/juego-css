import { Component } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Result {
    score: number;
    accuracy: number;
    speed: number;
    time: number;
    date: string;
}

@Component({
    selector: 'app-aim',
    standalone: true,
    imports: [NgIf, NgFor, NgStyle, FormsModule],
    templateUrl: './aim.component.html',
    styleUrls: ['./aim.component.css']
})

export class AimComponent {
    score = 0;
    totalClicks = 0;
    startTime = 0;
    endTime = 0;
    targetX = 0;
    targetY = 0;
    showTarget = false;
    showResults = false;
    lastClickTimes: number[] = [];
    results: Result[] = [];
    targetColor = '#3498db';
    borderRadius = 20;
    shadowSize = 10;
    rotation = 0;
    targetTimeLimit: number = 3; // por defecto 3 segundos
    timeoutId: any; // para el temporizador
    // sonidos
    hitSound = new Audio('sounds/hit.mp3');
    missSound = new Audio('sounds/miss.mp3');
    explosions: { x: number; y: number; gif: string }[] = [];


    constructor() {
        // Opcional: precargar para evitar retraso
        this.hitSound.load();
        this.missSound.load();
    }

    get resultsSorted(): Result[] {
        return [...this.results].sort((a, b) => a.time - b.time);
    }

    toggleResults() {
        this.showResults = !this.showResults;
    }

    startGame() {
        this.score = 0;
        this.totalClicks = 0;
        this.lastClickTimes = [];
        this.startTime = performance.now();
        this.spawnTarget();
    }

    spawnTarget() {
        clearTimeout(this.timeoutId); // limpiar temporizador previo

        this.targetX = Math.random() * 90;
        this.targetY = Math.random() * 90;
        this.showTarget = true;

        // 3 segundos para darle click
        this.timeoutId = setTimeout(() => {
            this.showTarget = false;
            this.score--; // pierde puntos si no le da click
            this.totalClicks++; // cuenta como fallo
            if (this.score < 0) this.score = 0; // no negativos
            this.spawnTarget(); // generar nuevo
        }, this.targetTimeLimit * 1000); // ahora depende del combo

    }

    hitTarget() {
        this.hitSound.currentTime = 0; // para que se pueda reproducir varias veces seguidas
        this.hitSound.play();

        // Forzar reinicio del GIF usando timestamp
        const explosionGif = `images/explosion.gif?${Date.now()}`;

        // Guardar posición para la explosión
        this.explosions.push({ x: this.targetX, y: this.targetY, gif: explosionGif });

        // Eliminar explosión después de 500 ms
        setTimeout(() => {
            this.explosions.shift();
        }, 800); // ajusta según duración real del gif

        clearTimeout(this.timeoutId);
        const now = performance.now();
        this.totalClicks++;
        this.score++;
        this.lastClickTimes.push(now);

        if (this.lastClickTimes.length > 2) {
            this.lastClickTimes.shift();
        }

        if (this.score >= 10) {
            this.endGame();
        } else {
            this.spawnTarget();
        }
    }

    missTarget() {
        this.missSound.currentTime = 0;
        this.missSound.play();
        this.totalClicks++;
    }

    endGame() {
        clearTimeout(this.timeoutId); // parar cualquier temporizador
        this.showTarget = false;
        this.endTime = performance.now();

        const totalTime = (this.endTime - this.startTime) / 1000;
        const accuracy = (this.score / this.totalClicks) * 100;

        let speed = 0;
        if (this.lastClickTimes.length === 2) {
            speed = (this.lastClickTimes[1] - this.lastClickTimes[0]) / 1000;
        }

        const result: Result = {
            score: this.score,
            accuracy: parseFloat(accuracy.toFixed(2)),
            speed: parseFloat(speed.toFixed(2)),
            time: parseFloat(totalTime.toFixed(2)),
            date: new Date().toLocaleString()
        };

        this.results.unshift(result);
        if (this.results.length > 10) {
            this.results.pop();
        }
    }

}