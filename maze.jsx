import React from 'react';

import Sketch from 'react-p5';

const width = 320;
const height = 320;
let rows, cols;
let cellSize = 20;

let current;
let grid = [];
let stack = [];

const getIndex = (i, j) =>
	i < 0 || j < 0 || i > cols - 1 || j > rows - 1 ? -1 : i + j * cols;

class Cell {
	constructor(i, j, p5) {
		this.i = i;
		this.j = j;
		this.walls = Array(4).fill(true);
		this.visited = false;

		this.checkNeighbours = _ => {
			let neighbours = [];

			let top = grid[getIndex(i, j - 1)];
			let right = grid[getIndex(i + 1, j)];
			let bottom = grid[getIndex(i, j + 1)];
			let left = grid[getIndex(i - 1, j)];

			[top, right, bottom, left].forEach(item => {
				if (item && !item.visited) neighbours.push(item);
			});

			return neighbours.length > 0
				? neighbours[Math.floor(Math.random() * neighbours.length)]
				: undefined;
		};

		this.highlight = p5 => {
			const x = this.i * cellSize;
			const y = this.j * cellSize;

			p5.noStroke();
			p5.fill(0, 0, 255, 100);
			p5.rect(y, x, cellSize, cellSize);
		};

		this.show = p5 => {
			let y = this.i * cellSize;
			let x = this.j * cellSize;
			p5.stroke(255);

			if (this.walls[0]) p5.line(x, y, x + cellSize, y); // top
			if (this.walls[1]) p5.line(x + cellSize, y, x + cellSize, y + cellSize); // right
			if (this.walls[2]) p5.line(x + cellSize, y + cellSize, x, y + cellSize); // bottom
			if (this.walls[3]) p5.line(x, y + cellSize, x, y); // left

			if (this.visited) {
				p5.noStroke();
				p5.fill(222, 222, 222, 100);
				p5.rect(x, y, cellSize, cellSize);
			}
		};
	}
}

const removeWalls = (a, b) => {
	const x = a.i - b.i;
	const y = a.j - b.j;

	a.walls[2 + y] = false;
	b.walls[2 - y] = false;

	a.walls[1 - x] = false;
	b.walls[1 + x] = false;
};

const maze = props => {
	const setup = (p5, canvasParentRef) => {
		p5.createCanvas(width, height).parent(canvasParentRef);
		p5.frameRate(10);

		cols = Math.floor(width / cellSize);
		rows = Math.floor(height / cellSize);

		for (const y of Array(cols).keys()) {
			for (const x of Array(rows).keys()) {
				const cell = new Cell(x, y);
				grid.push(cell);
			}
		}
		// might be problematic for smaller screens

		current = grid[0];
	};

	const draw = p5 => {
		p5.background(64);

		for (const i of Array(grid.length).keys()) {
			grid[i].show(p5);
		}

		if (props.shouldCreate) {
			current.visited = true;
			current.highlight(p5);
			let next = current.checkNeighbours();

			if (next) {
				next.visited = true;
				stack.push(current);
				removeWalls(current, next);
				current = next;
			} else if (stack.length > 0) {
				current = stack.pop();
			}
		}
	};

	return <Sketch setup={setup} draw={draw} />;
};

export default maze;
