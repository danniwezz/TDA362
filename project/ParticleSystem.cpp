#include "ParticleSystem.h"

void ParticleSystem::spawn(Particle particle){
	if (particles.size() < max_size){
		particles.push_back(particle);
	}
}

void ParticleSystem::kill(int id){
	particles[id] = particles.back();
	particles.pop_back();
}

void ParticleSystem::process_particles(float dt) {
	for (unsigned i = 0; i < particles.size(); ++i) {
		if (particles[i].life_length < particles[i].lifetime){
			kill(i);
		}
	}
	for (unsigned i = 0; i < particles.size(); ++i) {
		particles[i].lifetime += dt;
		particles[i].pos += particles[i].velocity * dt;
	}
}


/*
struct Particle {
	float lifetime;
	float life_length;
	glm::vec3 velocity;
	glm::vec3 pos;
};
class ParticleSystem {
public:
	// Members
	std::vector<Particle> particles;
	int max_size;
	// Ctor/Dtor
	ParticleSystem() : max_size(0) {}
	explicit ParticleSystem(int size) : max_size(size) {}
	~ParticleSystem() {}
	// Methods
	void kill(int id);
	void spawn(Particle particle);
	void process_particles(float dt);
};
*/