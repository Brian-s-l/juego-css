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
        this.targetX = Math.random() * 90;
        this.targetY = Math.random() * 90;
        this.showTarget = true;
    }

    hitTarget() {
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
        this.totalClicks++;
    }

    endGame() {
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
