history.scrollRestoration = "manual";

// We need to track and update the header, the nav links, and the page sections
const header = document.querySelector('[data-header]')
const sections = [...document.querySelectorAll('[data-section]')]
const headerLinks = [...document.querySelectorAll('[data-link]')]
const vid =document.querySelector('video')
const thresholds = sections.map((section, index) => {
    return index === 3 ? 0.5 : 0;
});


// Track and compare the last and current scroll direction
let prevYPosition = 0
let direction = 'up'

const options = {
	rootMargin: `${header.offsetHeight * -1}px`,
	threshold: thresholds
}

// Find and track the next target section when scrolling
const getTargetSection = (entry) => {
	const index = sections.findIndex((section) => section == entry.target)

	if (index >= sections.length - 1) {
		return entry.target
	} else {
		return sections[index + 1]
	}
}

// Update the global colour theme using a data attribute
const updateColor = (target) => {
	const theme = target.dataset.section
	target.setAttribute('data-theme', theme)
}

// Check whether or not we need to update the current target
const shouldUpdate = (entry) => {
	if (direction === 'down' && !entry.isIntersecting) {
		return true
	}

	if (direction === 'up' && entry.isIntersecting) {
		return true
	}

	return false
}

// Add .start when clicked
if (!sections[0].classList.contains('start')) {
	window.addEventListener('click', function() {
		sections[0].classList.add('start')
	})
}

// Add or remove class when in view
const updateStyle = (entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('visible');
			if (sections[3].classList.contains('visible')) {
				vid.play();
			}
		} else {
			entry.target.classList.remove('visible');
			if (!sections[3].classList.contains('visible')) {
				vid.pause();
			}
		}
	});
	
}

// Update the nav marker by:
// 1. getting the current section name
// 2. finding the nav item with that id
// 3. getting the relative position of that item within the nav
// 3. drawing an absolutely positioned line above it
const updateMarker = (target) => {
	const id = target.id

	if (!id) return

	let link = headerLinks.find((el) => {
		return el.getAttribute('href') === `#${id}`
	})

	link = link || headerLinks[0]

	const distanceFromLeft = link.getBoundingClientRect().left

	header.style.setProperty('--markerWidth', `${link.offsetWidth}px`)
	header.style.setProperty('--markerLeft', `${distanceFromLeft}px`)
}

// Run the observer, verify the scroll direction, update the entry when conditions pass
const onIntersect = (entries) => {
	entries.forEach((entry) => {
		if (window.scrollY > prevYPosition) {
			direction = 'down'
		} else {
			direction = 'up'
		}

		prevYPosition = window.scrollY

		const target = direction === 'down' ? getTargetSection(entry) : entry.target

		if (shouldUpdate(entry)) {
			updateColor(target)
			updateMarker(target)
		}
		updateStyle(entries)
	})
}

// Only update the nav marker after the new target has finished updating (when the colour theme has been changed and the scrolling has finished)
document.addEventListener('readystatechange', e => {
if (e.target.readyState === 'complete') {
    updateMarker(sections[0])
}
})

// Create our observer instance and pass in the sections to watch
const observer = new IntersectionObserver(onIntersect, options)

sections.forEach((section) => {
	observer.observe(section)
})