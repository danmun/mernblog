export const toggleCarousel = function (direction, slideIndex, slideCount) {
    let index = slideIndex;
    const [min, max] = [0, slideCount - 1];

    if (direction === "next") {
        index++;
    } else if (direction === "prev") {
        index--;
    }

    if (index === slideCount - 1 || index < 0) {
        // prevent going to the third slide if lesson tile is double-tapped
        // (dirty fix for broken Carousel animation if there are only 2 items)
        // slideCount - 1 because index is 0-based
        return {
            slideNavi: direction,
            slideIndex: slideIndex,
            slideCount: slideCount,
        };
    }

    if (index > max) {
        // at max, start from top
        index = 0;
    }

    if (index < min) {
        // at min, start from max
        index = max;
    }

    return {
        slideNavi: direction,
        slideIndex: index,
        slideCount: slideCount,
    };
};
