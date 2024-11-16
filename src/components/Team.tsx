import React from 'react';

const Team = () => {
  const teamMembers = [
    {
      name: 'Srishant Kumar',
      enrollment: '23UICS169',
      email: 'Srishant054@gmail.com',
      image: 'https://i.imgur.com/CC0IGFA.jpeg'
    },
    {
      name: 'Harshita Shankar',
      enrollment: '23UICS202',
      email: 'shankarharshita99@gmail.com',
      image: 'https://i.imgur.com/85imDjd.jpeg'
    }
  ];

  return (
    <section id="team" className="relative py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Team DefendX</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-red-500/20"
            >
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 mb-6 rounded-full overflow-hidden border-4 border-gradient-to-r from-red-500 to-red-700 shadow-lg">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-gray-300 mb-1">Enrollment: {member.enrollment}</p>
                <a 
                  href={`mailto:${member.email}`}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  {member.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
