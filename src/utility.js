import {useEffect, useRef} from 'react';

/**
 * Random int number between a minimum and a maximum number
 * @param {int} min 
 * @param {int} max 
 * @returns random number
 */
export function RandomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Sets up the interval
 * @param {any} callback
 * @param {any} delay
 * @returns interval
 */
export function UseInterval(callback, delay) {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
        savedCallback.current();
        }
        if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
        }
    }, [delay]);
}