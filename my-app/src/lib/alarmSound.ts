let activeContext: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];

export function playAlarmSound(): void {
 if (typeof window === 'undefined') {
 return;
 }
 const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
 if (!AudioContextClass) return;

 stopAlarmSound();

 try {
 activeContext = new AudioContextClass();
 const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

 frequencies.forEach((freq, index) => {
 if (!activeContext) return;
 const osc = activeContext.createOscillator();
 const gainNode = activeContext.createGain();

 osc.type = 'sine';
 osc.frequency.value = freq;

 osc.connect(gainNode);
 gainNode.connect(activeContext.destination);

 const now = activeContext.currentTime;
 const startTime = now + index * 0.1;
 gainNode.gain.setValueAtTime(0, startTime);
 gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.2);
 gainNode.gain.setValueAtTime(0.3, startTime + 1.3);
 gainNode.gain.linearRampToValueAtTime(0, startTime + 1.5);

 osc.start(startTime);
 osc.stop(startTime + 1.5);

 activeOscillators.push(osc);
 });
 } catch (error) {
 console.error("Failed to play alarm sound:", error);
 }
}

export function stopAlarmSound(): void {
 if (activeOscillators.length > 0) {
 activeOscillators.forEach(osc => {
 try {
 osc.stop();
 osc.disconnect();
 } catch (e) {
 // Ignore if already stopped
 }
 });
 activeOscillators = [];
 }
 if (activeContext) {
 try {
 if (activeContext.state !== 'closed') {
 activeContext.close();
 }
 } catch (e) {
 console.error("Error closing audio context:", e);
 }
 activeContext = null;
 }
}
