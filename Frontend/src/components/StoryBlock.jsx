import RevealOnScroll from "./RevealOnScroll";
import "./StoryBlock.css";

function StoryBlock({ eyebrow, title, description, image, reverse = false }) {
  return (
    <RevealOnScroll>
      <div className={`story-block ${reverse ? "story-block-reverse" : ""}`}>
        <div className="story-block-text">
          <p className="story-block-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="story-block-desc">{description}</p>
        </div>
        <div className="story-block-image">
          {image && <img src={image} alt="" loading="lazy" />}
        </div>
      </div>
    </RevealOnScroll>
  );
}

export default StoryBlock;