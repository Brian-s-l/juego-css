import { Component } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
// interfaz para resultados
interface Result {
    score: number;
    accuracy: number;
    speed: number;
    time: number;
    date: string;
}
// componente
@Component({
    selector: 'app-aim',
    standalone: true,
    imports: [NgIf, NgFor, NgStyle, FormsModule],
    templateUrl: './aim.component.html',
    styleUrls: ['./aim.component.css']
})
// clase del componente
export class AimComponent {
    gameHeight = 400;
    gameWidth: number = 500; // ancho inicial del área de juego en px

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



    // precargar sonidos
    constructor() {
        // Opcional: precargar para evitar retraso
        this.hitSound.load();
        this.missSound.load();
    }
    // ordenar resultados por tiempo (ascendente)
    get resultsSorted(): Result[] {
        return [...this.results].sort((a, b) => a.time - b.time);
    }
    // alternar vista de resultados
    toggleResults() {
        this.showResults = !this.showResults;
    }
    // iniciar juego
    startGame() {
        this.score = 0;
        this.totalClicks = 0;
        this.lastClickTimes = [];
        this.startTime = performance.now();
        this.spawnTarget();
    }
    // generar objetivo
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
    // acertar objetivo
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
        // mantener solo los últimos 2 tiempos
        if (this.lastClickTimes.length > 2) {
            this.lastClickTimes.shift();
        }
        // aumentar dificultad cada 5 puntos
        if (this.score >= 10) {
            this.endGame();
        } else {
            this.spawnTarget();
        }
    }
    // fallar objetivo
    missTarget() {
        this.missSound.currentTime = 0;
        this.missSound.play();
        this.totalClicks++;
    }
    // terminar juego
    endGame() {
        clearTimeout(this.timeoutId); // parar cualquier temporizador
        this.showTarget = false;
        this.endTime = performance.now();
        // calcular estadísticas
        const totalTime = (this.endTime - this.startTime) / 1000;
        const accuracy = (this.score / this.totalClicks) * 100;
        // calcular velocidad (clics por segundo)
        let speed = 0;
        if (this.lastClickTimes.length === 2) {
            speed = (this.lastClickTimes[1] - this.lastClickTimes[0]) / 1000;
        }
        // guardar resultado
        const result: Result = {
            score: this.score,
            accuracy: parseFloat(accuracy.toFixed(2)),
            speed: parseFloat(speed.toFixed(2)),
            time: parseFloat(totalTime.toFixed(2)),
            date: new Date().toLocaleString()
        };
        // mantener solo los últimos 10 resultados
        this.results.unshift(result);
        if (this.results.length > 10) {
            this.results.pop();
        }
    }

}